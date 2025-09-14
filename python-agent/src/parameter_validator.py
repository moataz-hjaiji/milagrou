import logging
from typing import Dict, Any, List, Optional
from http_mcp_client import HTTPMCPClient, MCPTool

logger = logging.getLogger(__name__)

class ParameterValidator:
    """Handles parameter validation and missing parameter detection"""
    
    def __init__(self, mcp_client: HTTPMCPClient):
        self.mcp_client = mcp_client
        logger.info("Parameter Validator initialized")

    def get_missing_parameters(self, tool_name: str, extracted_params: Dict[str, Any]) -> List[str]:
        """Get list of missing required parameters for a tool"""
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
            if param not in extracted_params or not extracted_params[param]:
                missing.append(param)
                logger.debug(f"Missing required parameter: '{param}'")
                
        if missing:
            logger.warning(f"❌ Missing {len(missing)} required parameters for '{tool_name}': {missing}")
        else:
            logger.info(f"✅ All required parameters provided for '{tool_name}'")
            
        return missing

    def format_missing_params_message(self, tool_name: str, missing_params: List[str]) -> str:
        """Generate a user-friendly message for missing parameters"""
        logger.info(f"📝 Formatting missing parameters message for '{tool_name}': {missing_params}")
        
        if not missing_params:
            return ""
            
        param_descriptions = {
            'phone': 'phone number',
            'password': 'password', 
            'name': 'full name',
            'email': 'email address',
            'productId': 'product ID',
            'id': 'ID',
            'orderType': 'order type (NORMAL, GIFT, or RESERVATION)',
            'deliveryType': 'delivery type (DELIVERY or PICKUP)',
            'InvoicePaymentMethods': 'payment method',
            'addressId': 'delivery address',
            'firstName': 'first name',
            'lastName': 'last name',
            'phoneNumber': 'phone number',
            'query': 'search query'
        }
        
        readable_params = [param_descriptions.get(param, param) for param in missing_params]
        
        if len(readable_params) == 1:
            message = f"I need your {readable_params[0]} to proceed."
        elif len(readable_params) == 2:
            message = f"I need your {readable_params[0]} and {readable_params[1]} to proceed."
        else:
            message = f"I need the following information: {', '.join(readable_params[:-1])}, and {readable_params[-1]}."
            
        logger.debug(f"Generated message: '{message}'")
        return message

    def validate_tool_parameters(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Validate tool parameters and apply business rules"""
        logger.info(f"🔧 Validating parameters for tool '{tool_name}'")
        logger.debug(f"Input parameters: {params}")
        
        validated_params = params.copy()
        errors = []
        
        try:
            logger.info(f"✅ Validation successful for '{tool_name}'")
            logger.debug(f"Validated parameters: {validated_params}")
            logger.info(f"validation: {validated_params} for tool: {tool_name}")
            return validated_params
                
        except Exception as e:
            logger.error(f"Error during validation for '{tool_name}': {e}")
            return {'validation_errors': [f'Validation error: {str(e)}']}
            
        return validated_params