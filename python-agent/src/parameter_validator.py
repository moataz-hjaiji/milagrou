import logging
from typing import Dict, Any, List, Optional, Tuple
from http_mcp_client import HTTPMCPClient, MCPTool
from prompt_registry import PromptRegistry

logger = logging.getLogger(__name__)

class ParameterValidator:
    """Handles parameter validation and missing parameter detection, including enums."""
    
    def __init__(self, mcp_client: HTTPMCPClient, prompt_registry: Optional[PromptRegistry] = None):
        self.mcp_client = mcp_client
        self.prompt_registry = prompt_registry or PromptRegistry()
        logger.info("Parameter Validator initialized")

    def get_missing_parameters(self, tool_name: str, extracted_params: Dict[str, Any]) -> List[str]:
        """Get list of missing required parameters for a tool based on MCP schema"""
        logger.info(f"🔍 Checking missing parameters for tool '{tool_name}'")
        logger.debug(f"Current parameters: {extracted_params}")
        
        missing = []
        
        # Find the tool schema
        tool_schema = None
        tools = self.mcp_client.get_tools()
        
        for tool in tools:
            if tool.name == tool_name:
                tool_schema = tool.input_schema
                break
                
        if not tool_schema:
            logger.warning(f"❌ Tool schema not found for '{tool_name}'")
            return missing
            
        logger.debug(f"Found tool schema for '{tool_name}': {tool_schema}")
        
        # Check required parameters
        required_params = tool_schema.get('required', [])
        logger.debug(f"Required parameters: {required_params}")
        
        for param in required_params:
            if param not in extracted_params or extracted_params.get(param) in (None, ""):
                missing.append(param)
                logger.debug(f"Missing required parameter: '{param}'")
                
        if missing:
            logger.warning(f"❌ Missing {len(missing)} required parameters for '{tool_name}': {missing}")
        else:
            logger.info(f"✅ All required parameters provided for '{tool_name}'")
            
        return missing

    def format_missing_params_message(self, tool_name: str, missing_params: List[str], invalid_params: Optional[Dict[str, List[str]]] = None) -> str:
        """Generate a user-friendly message for missing/invalid parameters, including allowed values for enums."""
        logger.info(f"📝 Formatting missing parameters message for '{tool_name}': {missing_params}, invalid={invalid_params}")
        
        invalid_params = invalid_params or {}
        if not missing_params and not invalid_params:
            return ""
            
        param_descriptions = {
            'phone': 'phone number',
            'password': 'password', 
            'name': 'full name',
            'email': 'email address',
            'productId': 'product ID',
            'id': 'ID',
            'deliveryType': 'delivery type (DELIVERY or PICKUP)',
            'InvoicePaymentMethods': 'payment method',
            'paymentMethod': 'payment method',
            'addressId': 'delivery address',
            'firstName': 'first name',
            'lastName': 'last name',
            'phoneNumber': 'phone number',
            'query': 'search query',
            'orderType': 'order type (GIFT, RESERVATION, or NORMAL)'
        }
        
        parts: List[str] = []
        if missing_params:
            readable_params = [param_descriptions.get(param, param) for param in missing_params]
            if len(readable_params) == 1:
                parts.append(f"I need your {readable_params[0]} to proceed.")
            elif len(readable_params) == 2:
                parts.append(f"I need your {readable_params[0]} and {readable_params[1]} to proceed.")
            else:
                parts.append(f"I need the following information: {', '.join(readable_params[:-1])}, and {readable_params[-1]}.")
        
        # Add invalid enum guidance
        for field, allowed in invalid_params.items():
            allowed_str = ', '.join(allowed)
            parts.append(f"Please provide a valid {param_descriptions.get(field, field)}. Allowed values: {allowed_str}.")
        
        message = " ".join(parts).strip()
        logger.debug(f"Generated message: '{message}'")
        return message

    def validate_tool_parameters(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Validate tool parameters and apply business rules, including enum checks via PromptRegistry."""
        logger.info(f"🔧 Validating parameters for tool '{tool_name}'")
        logger.debug(f"Input parameters: {params}")
        
        validated_params = params.copy()
        
        # Apply enum validations from action templates when available
        filled, missing, invalid = self.prompt_registry.validate_params(tool_name, validated_params)
        errors: List[str] = []
        if missing:
            errors.append(f"Missing required parameters: {', '.join(missing)}")
        if invalid:
            errors.append("Invalid parameter values: " + ", ".join([f"{k} (allowed: {', '.join(v)})" for k, v in invalid.items()]))
        
        if errors:
            logger.warning(f"Validation issues for '{tool_name}': {errors}")
            return {
                'validation_errors': errors,
                'missing': missing,
                'invalid': invalid
            }
        
        logger.info(f"✅ Validation successful for '{tool_name}'")
        logger.debug(f"Validated parameters: {filled}")
        return filled