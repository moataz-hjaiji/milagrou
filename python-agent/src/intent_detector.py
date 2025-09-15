import json
import logging
from langchain.prompts import ChatPromptTemplate
from langchain.schema import SystemMessage, HumanMessage
from http_mcp_client import HTTPMCPClient 
from langchain_openai import AzureChatOpenAI
from pydantic import BaseModel
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class IntentResult(BaseModel):
    """Minimal result of intent detection"""
    tool_name: str
    service: str
    confidence: float
    requires_auth: bool = False
    extracted_params: Optional[Dict[str, Any]] = None

class IntentDetector:
    def __init__(self, mcp_client: HTTPMCPClient, llm: AzureChatOpenAI):
        self.mcp_client = mcp_client
        self.llm = llm
        self.available_tools = self._load_tools_from_mcp()
        logger.info(f"✅ Loaded {len(self.available_tools)} tools")


    def _load_tools_from_mcp(self) -> Dict[str, Dict[str, Any]]:
        try:
            tools = self.mcp_client.get_tools()
            logger.info(tools)
            available = {}
            for tool in tools:
                if isinstance(tool, dict):
                    extracted_params = tool.get("inputSchema") or tool.get("input_schema")
                    name = tool.get("name")
                    description = tool.get("description", "")
                    service = tool.get("service", "default")
                    protected = tool.get("protected", False)
                else:
                    extracted_params = getattr(tool, "inputSchema", getattr(tool, "input_schema", None))
                    name = getattr(tool, "name")
                    description = getattr(tool, "description", "")
                    service = getattr(tool, "service", "default")
                    protected = getattr(tool, "protected", False)
                
                available[name] = {
                    "description": description,
                    "service": service,
                    "protected": protected,
                    "extracted_params": extracted_params
                }
            return available
        except Exception as e:
            logger.error(f"❌ Failed to load tools from MCP: {e}")
            return {}

    def detect_intent(self, user_input: str) -> Optional[IntentResult]:
        self.available_tools = self._load_tools_from_mcp()
        if not self.available_tools:
            logger.warning("⚠️ No tools available for detection")
            return None

        # Construct prompt
        tool_list = [
        {
            "name": name,
            "description": info["description"],
            "service": info["service"],
            "extracted_params": info.get("extracted_params")
        }
        for name, info in self.available_tools.items()
        ]

        logger.debug(f"Available tools for intent detection: {tool_list}")  
        tool_json = json.dumps(tool_list, indent=2)

        system_prompt = system_prompt = """You are an intent detection assistant.
        Return ONLY a JSON object with this structure:
        {
        "tool_name": "string or null",
        "service": "string or null",
        "confidence": float,
        "requires_auth": boolean
        }

        Given a user request and a list of available tools, choose the single best tool
        that matches the intent. 

        - The field "requires_auth" must be true if the selected tool/service is protected (requires user authentication). 
        - If the tool/service is public (no authentication needed), set "requires_auth" to false. 
        - Always infer this based on the tool's service or description, do not hardcode. 

        Always return the JSON object exactly as specified.  
        If no tool matches, return:
        {
        "tool_name": null,
        "service": null,
        "confidence": 0.0,
        "requires_auth": false
        }"""


        human_prompt = f"""
            User request: {user_input}

            Available tools:
            {tool_json}
            """

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt)
        ]

        try:
            logger.info(f"🤖 Detecting intent for input: {user_input}")
            logger.debug(f"Using prompt messages: {messages}")
            response = self.llm.invoke(messages)
            llm_output = response.content.strip()
            logger.debug(f"LLM raw response: {llm_output}")

            try:
                parsed = json.loads(llm_output)
            except json.JSONDecodeError:
                logger.error("❌ LLM did not return valid JSON")
                return None
            logger.info(f"✅ Detected intent: {parsed}")
            if parsed.get("tool_name"):
                tool_info = self.available_tools.get(parsed["tool_name"], {})
                return IntentResult(
                    tool_name=parsed["tool_name"],
                    service=parsed["service"],
                    confidence=parsed["confidence"],
                    requires_auth=parsed.get("requires_auth", False),
                    extracted_params=tool_info.get("extracted_params")
                )

            
        except Exception as e:
            logger.error(f"❌ Intent detection failed: {e}")

        return None
