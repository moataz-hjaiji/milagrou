from typing import Optional, Dict, Any, List, Tuple
from dataclasses import dataclass, field


@dataclass
class ActionParam:
    name: str
    required: bool = False
    type: str = "string"
    enum: Optional[List[str]] = None
    description: Optional[str] = None
    default: Optional[Any] = None


@dataclass
class ActionTemplate:
    name: str
    description: str
    template: str
    params: List[ActionParam] = field(default_factory=list)

    def schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "required": [p.name for p in self.params if p.required],
            "properties": {
                p.name: {
                    k: v
                    for k, v in {
                        "type": p.type,
                        "enum": p.enum,
                        "description": p.description,
                        "default": p.default,
                    }.items()
                    if v is not None
                }
                for p in self.params
            },
        }

    def render(self, values: Dict[str, Any]) -> str:
        return self.template.format(**values)


class PromptRegistry:
    """Maps intents/tools to directive snippets and action-level templates with validation."""

    def __init__(self):
        # Base directives per intent
        product_list_directive = (
            "For product-browsing intents, you must: \n"
            "- Use the appropriate product tools to fetch real data.\n"
            "- Respond in two parts: first a brief, user-friendly summary; then an easily parseable JSON object.\n"
            "- The JSON must be a single object with keys: products (array) and pagination (object with page, limit, total, totalPages or similar).\n"
            "- Do not invent data. Preserve field names/values from the tool results.\n"
            "- Keep responses paginated and mention current page and total pages if available.\n"
        )

        single_product_directive = (
            "For single-product intents, you must: \n"
            "- Use the product tool to fetch the exact item.\n"
            "- Include a concise human summary and a JSON object with key: product.\n"
            "- Do not invent data. Preserve field names/values from the tool results.\n"
        )

        cart_directive = (
            "For cart intents, you must: \n"
            "- Use cart tools (get_cart, add_to_cart, remove_from_cart, update_cart_item) as needed.\n"
            "- Provide a friendly summary and a JSON object with the authoritative cart payload.\n"
            "- If authentication is required, clearly state that login is needed.\n"
        )

        orders_directive = (
            "For order intents, you must: \n"
            "- Use order tools to fetch or modify orders.\n"
            "- Provide a friendly summary and a JSON object with either orders (array) or order (object).\n"
        )

        general_directive = (
            "For general chat, be concise and helpful. If the user pivots to shopping, apply the relevant product/cart/order guidance.\n"
        )

        self.intent_directives: Dict[str, str] = {
            "get_products": product_list_directive,
            "search_products": product_list_directive,
            "get_categories": product_list_directive,
            "get_product": single_product_directive,
            "get_cart": cart_directive,
            "add_to_cart": cart_directive,
            "remove_from_cart": cart_directive,
            "update_cart_item": cart_directive,
            "get_orders": orders_directive,
            "get_order": orders_directive,
            "general_chat": general_directive,
        }

        # Enumerations used across actions
        self.allowed_values = {
            "orderType": ["GIFT", "RESERVATION", "NORMAL"],
            "deliveryType": ["DELIVERY", "PICKUP"],
            # Keep payment methods generic; can be adjusted to backend values later
            "paymentMethod": ["CASH", "CARD", "WALLET"],
        }

        # Action-level templates
        self.action_templates: Dict[str, ActionTemplate] = {
            # Product operations
            "get_products": ActionTemplate(
                name="get_products",
                description="Retrieve products with optional filters and pagination",
                template=(
                    "ACTION: get_products\n"
                    "ARGS: {{\n"
                    "  \"page\": {page},\n"
                    "  \"limit\": {limit},\n"
                    "  \"category\": \"{category}\",\n"
                    "  \"search\": \"{search}\",\n"
                    "  \"minPrice\": {minPrice},\n"
                    "  \"maxPrice\": {maxPrice}\n"
                    "}}\n"
                    "RETURN: Only the JSON output from the tool."
                ),
                params=[
                    ActionParam("page", type="number", default=1),
                    ActionParam("limit", type="number", default=10),
                    ActionParam("category", type="string", default=""),
                    ActionParam("search", type="string", default=""),
                    ActionParam("minPrice", type="number", default="null"),
                    ActionParam("maxPrice", type="number", default="null"),
                ],
            ),
            "search_products": ActionTemplate(
                name="search_products",
                description="Search for products by query",
                template=(
                    "ACTION: search_products\n"
                    "ARGS: {{\n"
                    "  \"query\": \"{query}\",\n"
                    "  \"limit\": {limit}\n"
                    "}}\n"
                    "RETURN: Only the JSON output from the tool."
                ),
                params=[
                    ActionParam("query", required=True, type="string"),
                    ActionParam("limit", type="number", default=10),
                ],
            ),
            "get_product": ActionTemplate(
                name="get_product",
                description="Get details for a single product",
                template=(
                    "ACTION: get_product\n"
                    "ARGS: {{\n"
                    "  \"id\": \"{id}\"\n"
                    "}}\n"
                    "RETURN: Only the JSON output from the tool."
                ),
                params=[ActionParam("id", required=True, type="string")],
            ),
            # Cart operations
            "add_to_cart": ActionTemplate(
                name="add_to_cart",
                description="Add a product to the authenticated user's cart",
                template=(
                    "ACTION: add_to_cart\n"
                    "ARGS: {{\n"
                    "  \"userId\": \"{userId}\",\n"
                    "  \"productId\": \"{productId}\",\n"
                    "  \"quantity\": {quantity}\n"
                    "}}\n"
                    "RETURN: Only the JSON output from the tool."
                ),
                params=[
                    ActionParam("userId", required=True, type="string"),
                    ActionParam("productId", required=True, type="string"),
                    ActionParam("quantity", type="number", default=1),
                ],
            ),
            "get_cart": ActionTemplate(
                name="get_cart",
                description="Get the authenticated user's cart",
                template=(
                    "ACTION: get_cart\n"
                    "ARGS: {{\n"
                    "  \"userId\": \"{userId}\"\n"
                    "}}\n"
                    "RETURN: Only the JSON output from the tool."
                ),
                params=[ActionParam("userId", required=True, type="string")],
            ),
            # Order operations with enumerations aligned to MCP schema
            "create_order": ActionTemplate(
                name="create_order",
                description="Create a new order for the authenticated user",
                template=(
                    "ACTION: create_order\n"
                    "ARGS: {{\n"
                    "  \"userId\": \"{userId}\",\n"
                    "  \"orderType\": \"{orderType}\",  // Allowed: GIFT | RESERVATION | NORMAL\n"
                    "  \"deliveryType\": \"{deliveryType}\",  // Allowed: DELIVERY | PICKUP\n"
                    "  \"addressId\": \"{addressId}\",\n"
                    "  \"InvoicePaymentMethods\": {InvoicePaymentMethods}\n"
                    "}}\n"
                    "STRICT: Ensure orderType and deliveryType use allowed values exactly.\n"
                    "RETURN: Only the JSON output from the tool."
                ),
                params=[
                    ActionParam("userId", required=False, type="string"),
                    ActionParam("orderType", required=True, type="string", enum=["GIFT", "RESERVATION", "NORMAL"]),
                    ActionParam("deliveryType", required=True, type="string", enum=["DELIVERY", "PICKUP"]),
                    ActionParam("addressId", required=False, type="string"),
                    ActionParam("InvoicePaymentMethods", required=True, type="array"),
                ],
            ),
            "get_orders": ActionTemplate(
                name="get_orders",
                description="Get list of user's orders",
                template=(
                    "ACTION: get_orders\n"
                    "ARGS: {{\n"
                    "  \"userId\": \"{userId}\"\n"
                    "}}\n"
                    "RETURN: Only the JSON output from the tool."
                ),
                params=[ActionParam("userId", required=True, type="string")],
            ),
            "get_order": ActionTemplate(
                name="get_order",
                description="Get a specific order by ID for the authenticated user",
                template=(
                    "ACTION: get_order\n"
                    "ARGS: {{\n"
                    "  \"userId\": \"{userId}\",\n"
                    "  \"id\": \"{id}\"\n"
                    "}}\n"
                    "RETURN: Only the JSON output from the tool."
                ),
                params=[
                    ActionParam("userId", required=True, type="string"),
                    ActionParam("id", required=True, type="string"),
                ],
            ),
        }

    def get_directive(self, intent: Optional[str] = None, options: Optional[Dict] = None) -> str:
        """Return the directive for an intent, optionally augmented with formatting requirements."""
        options = options or {}
        base = self.intent_directives.get(intent or "general_chat", self.intent_directives["general_chat"]) or ""

        # Optional Slack formatting hint
        output_format = options.get("output_format")
        if output_format == "slack":
            slack_hint = (
                "\nWhen output_format is 'slack':\n"
                "- Keep human text concise (Slack UI will show block items).\n"
                "- Avoid markdown code fences.\n"
                "- Ensure the JSON object is still present so the app can render blocks.\n"
            )
            return base + "\n" + slack_hint

        return base

    def get_action_template(self, action: str) -> Optional[ActionTemplate]:
        return self.action_templates.get(action)

    def get_action_schema(self, action: str) -> Optional[Dict[str, Any]]:
        tpl = self.get_action_template(action)
        return tpl.schema() if tpl else None

    def validate_params(self, action: str, params: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str], Dict[str, List[str]]]:
        """Validate params against the action template; returns (filled_params, missing, invalid_map)."""
        tpl = self.get_action_template(action)
        if not tpl:
            return params, [], {}

        schema = tpl.schema()
        required = set(schema.get("required", []))
        props = schema.get("properties", {})

        # Fill defaults and detect missing
        filled = params.copy()
        missing: List[str] = []
        invalid: Dict[str, List[str]] = {}

        for name, meta in props.items():
            if name not in filled or filled.get(name) in (None, ""):
                if name in required:
                    if "default" in meta and meta["default"] is not None:
                        filled[name] = meta["default"]
                    else:
                        missing.append(name)
                else:
                    if "default" in meta and meta["default"] is not None:
                        filled[name] = meta["default"]

            # Enum validation
            if name in filled and meta.get("enum"):
                value = filled.get(name)
                canonical_allowed = meta["enum"]
                allowed_upper = [str(v).upper() for v in canonical_allowed]
                if isinstance(value, str):
                    value_upper = value.upper().strip()
                else:
                    value_upper = str(value).upper()
                if value_upper in allowed_upper:
                    # Coerce to canonical representation positionally
                    idx = allowed_upper.index(value_upper)
                    filled[name] = canonical_allowed[idx]
                else:
                    invalid[name] = canonical_allowed

        return filled, missing, invalid

    def render_action_prompt(self, action: str, params: Dict[str, Any]) -> Optional[str]:
        tpl = self.get_action_template(action)
        if not tpl:
            return None
        # Ensure all placeholders exist with defaults
        filled, missing, invalid = self.validate_params(action, params)
        if missing or invalid:
            return None
        # Convert None-like values for JSON placeholders
        def to_json_val(v: Any) -> Any:
            return v if v not in (None, "null") else "null"
        normalized = {k: to_json_val(v) for k, v in filled.items()}
        return tpl.render(normalized)
