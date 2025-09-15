from typing import Optional, Dict

class PromptRegistry:
    """Maps intents/tools to directive snippets injected into the agent prompt per request."""

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
