import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class MissingParameterHandler:
    """
    Handles missing parameters interactively by prompting the user until all required info is provided.
    Also supports invalid parameter values (e.g., enumerations) and guides the user.
    """

    def __init__(self, parameter_validator):
        """
        :param parameter_validator: Your existing validator with methods:
            - get_missing_parameters(tool_name, params)
            - format_missing_params_message(tool_name, missing_params, invalid_params=None)
        """
        self.parameter_validator = parameter_validator

    async def build_missing_or_invalid_prompt(
        self, tool_name: str, current_params: Dict[str, Any], invalid_params: Optional[Dict[str, List[str]]] = None
    ) -> Optional[str]:
        """Compose a single, friendly prompt message for missing/invalid params. Returns None if nothing is missing/invalid."""
        missing_params = self.parameter_validator.get_missing_parameters(tool_name, current_params)
        invalid_params = invalid_params or {}
        if not missing_params and not invalid_params:
            return None
        return self.parameter_validator.format_missing_params_message(tool_name, missing_params, invalid_params)

    async def prompt_for_missing_parameters(
        self, tool_name: str, current_params: Dict[str, Any], send_prompt_fn
    ) -> Dict[str, Any]:
        """
        Iteratively prompts user for missing parameters until all are filled.

        NOTE: In the current chat flow, we typically return a question to the caller to ask the user,
        so this method can be bypassed in favor of build_missing_or_invalid_prompt(). Keeping for backward compatibility.

        :param tool_name: Name of the tool being executed
        :param current_params: Current parameters dictionary (may be incomplete)
        :param send_prompt_fn: Async callable to send a prompt to the user and get a response
        :return: Complete parameters dictionary
        """
        params = current_params.copy()

        while True:
            missing_params = self.parameter_validator.get_missing_parameters(tool_name, params)
            if not missing_params:
                logger.info(f"✅ All required parameters provided for '{tool_name}'")
                break

            # Generate a message for the user
            prompt_message = self.parameter_validator.format_missing_params_message(
                tool_name, missing_params
            )
            logger.warning(f"❌ Missing parameters: {missing_params}")
            user_response = await send_prompt_fn(prompt_message)

            # Update params with user-provided values
            for key, value in user_response.items():
                params[key] = value

        return params
