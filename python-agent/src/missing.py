import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class MissingParameterHandler:
    """
    Handles missing parameters interactively by prompting the user until all required info is provided.
    """

    def __init__(self, parameter_validator):
        """
        :param parameter_validator: Your existing validator with methods:
            - get_missing_parameters(tool_name, params)
            - format_missing_params_message(tool_name, missing_params)
        """
        self.parameter_validator = parameter_validator

    async def prompt_for_missing_parameters(
        self, tool_name: str, current_params: Dict[str, Any], send_prompt_fn
    ) -> Dict[str, Any]:
        """
        Iteratively prompts user for missing parameters until all are filled.

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
