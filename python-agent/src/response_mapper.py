import json
import logging
from typing import Dict, Any, List, Optional
from response_types import ResponseType, create_response, BaseResponse

logger = logging.getLogger(__name__)

class ResponseMapper:
    """Maps MCP tool responses to structured JSON responses"""
    
    @staticmethod
    def map_tool_response(tool_name: str, mcp_response: Dict[str, Any]) -> BaseResponse:
        """Map MCP tool response to structured response based on tool name"""
        
        try:
            # Extract data from MCP response
            success = mcp_response.get("statusCode") == 200 if "statusCode" in mcp_response else True
            message = mcp_response.get("message", "")
            data = mcp_response.get("docs", mcp_response.get("data", mcp_response))
            
            # Map tool names to response types and create structured responses
            if tool_name in ["get_products", "search_products"]:
                return ResponseMapper._map_products_response(tool_name, success, message, data)
            elif tool_name == "get_product":
                return ResponseMapper._map_product_details_response(success, message, data)
            elif tool_name in ["get_categories"]:
                return ResponseMapper._map_categories_response(success, message, data)
            elif tool_name == "get_category":
                return ResponseMapper._map_category_details_response(success, message, data)
            elif tool_name == "get_cart":
                return ResponseMapper._map_cart_response(success, message, data)
            elif tool_name in ["add_to_cart", "update_cart_item", "remove_from_cart", "clear_cart"]:
                return ResponseMapper._map_cart_action_response(tool_name, success, message, data)
            elif tool_name in ["get_orders"]:
                return ResponseMapper._map_orders_response(success, message, data)
            elif tool_name in ["get_order", "create_order", "cancel_order", "track_order"]:
                return ResponseMapper._map_order_response(tool_name, success, message, data)
            elif tool_name in ["get_profile", "update_profile"]:
                return ResponseMapper._map_user_profile_response(tool_name, success, message, data)
            elif tool_name in ["get_addresses", "add_address", "update_address", "delete_address"]:
                return ResponseMapper._map_address_response(tool_name, success, message, data)
            elif tool_name in ["login_user", "register_user", "logout_user", "refresh_token"]:
                return ResponseMapper._map_auth_response(tool_name, success, message, data)
            else:
                # Generic response for unknown tools
                return create_response(
                    ResponseType.SUCCESS if success else ResponseType.ERROR,
                    success=success,
                    message=message,
                    data=data
                )
                
        except Exception as e:
            logger.error(f"Error mapping response for tool {tool_name}: {e}")
            return create_response(
                ResponseType.ERROR,
                success=False,
                message="Error processing response",
                error=str(e)
            )
    
    @staticmethod
    def _map_products_response(tool_name: str, success: bool, message: str, data: Any) -> BaseResponse:
        """Map products list response"""
        response_type = ResponseType.PRODUCT_SEARCH if tool_name == "search_products" else ResponseType.PRODUCTS_LIST
        
        if isinstance(data, list):
            products = data
            total_count = len(products)
        elif isinstance(data, dict) and "docs" in data:
            products = data["docs"]
            total_count = data.get("totalDocs", len(products))
        else:
            products = []
            total_count = 0
        
        return create_response(
            response_type=response_type,
            success=success,
            message=message,
            data={
                "products": products,
                "total_count": total_count,
                "page": data.get("page", 1) if isinstance(data, dict) else 1,
                "limit": data.get("limit", 10) if isinstance(data, dict) else 10
            }
        )
    
    @staticmethod
    def _map_product_details_response(success: bool, message: str, data: Any) -> BaseResponse:
        """Map single product details response"""
        return create_response(
            response_type=ResponseType.PRODUCT_DETAILS,
            success=success,
            message=message,
            data={"product": data} if data else None
        )
    
    @staticmethod
    def _map_categories_response(success: bool, message: str, data: Any) -> BaseResponse:
        """Map categories list response"""
        if isinstance(data, list):
            categories = data
        elif isinstance(data, dict) and "docs" in data:
            categories = data["docs"]
        else:
            categories = []
        
        return create_response(
            response_type=ResponseType.CATEGORIES_LIST,
            success=success,
            message=message,
            data={"categories": categories}
        )
    
    @staticmethod
    def _map_category_details_response(success: bool, message: str, data: Any) -> BaseResponse:
        """Map single category details response"""
        return create_response(
            response_type=ResponseType.CATEGORY_DETAILS,
            success=success,
            message=message,
            data={"category": data} if data else None
        )
    
    @staticmethod
    def _map_cart_response(success: bool, message: str, data: Any) -> BaseResponse:
        """Map cart view response"""
        if isinstance(data, list):
            cart_items = data
        elif isinstance(data, dict) and "items" in data:
            cart_items = data["items"]
        else:
            cart_items = []
        
        total_items = len(cart_items)
        total_price = sum(item.get("price", 0) * item.get("quantity", 0) for item in cart_items)
        
        return create_response(
            response_type=ResponseType.CART_VIEW,
            success=success,
            message=message,
            data={
                "cart_items": cart_items,
                "total_items": total_items,
                "total_price": total_price
            }
        )
    
    @staticmethod
    def _map_cart_action_response(tool_name: str, success: bool, message: str, data: Any) -> BaseResponse:
        """Map cart action responses (add, update, remove, clear)"""
        response_type_map = {
            "add_to_cart": ResponseType.CART_ADDED,
            "update_cart_item": ResponseType.CART_UPDATED,
            "remove_from_cart": ResponseType.CART_REMOVED,
            "clear_cart": ResponseType.CART_CLEARED
        }
        
        return create_response(
            response_type=response_type_map.get(tool_name, ResponseType.SUCCESS),
            success=success,
            message=message,
            data={"result": data} if data else None
        )
    
    @staticmethod
    def _map_orders_response(success: bool, message: str, data: Any) -> BaseResponse:
        """Map orders list response"""
        if isinstance(data, list):
            orders = data
        elif isinstance(data, dict) and "docs" in data:
            orders = data["docs"]
        else:
            orders = []
        
        return create_response(
            response_type=ResponseType.ORDERS_LIST,
            success=success,
            message=message,
            data={"orders": orders}
        )
    
    @staticmethod
    def _map_order_response(tool_name: str, success: bool, message: str, data: Any) -> BaseResponse:
        """Map order-related responses"""
        response_type_map = {
            "get_order": ResponseType.ORDER_DETAILS,
            "create_order": ResponseType.ORDER_CREATED,
            "cancel_order": ResponseType.ORDER_CANCELLED,
            "track_order": ResponseType.ORDER_TRACKING
        }
        
        return create_response(
            response_type=response_type_map.get(tool_name, ResponseType.SUCCESS),
            success=success,
            message=message,
            data={"order": data} if data else None
        )
    
    @staticmethod
    def _map_user_profile_response(tool_name: str, success: bool, message: str, data: Any) -> BaseResponse:
        """Map user profile responses"""
        response_type = ResponseType.USER_UPDATED if tool_name == "update_profile" else ResponseType.USER_PROFILE
        
        return create_response(
            response_type=response_type,
            success=success,
            message=message,
            data={"user": data} if data else None
        )
    
    @staticmethod
    def _map_address_response(tool_name: str, success: bool, message: str, data: Any) -> BaseResponse:
        """Map address-related responses"""
        response_type_map = {
            "get_addresses": ResponseType.ADDRESSES_LIST,
            "add_address": ResponseType.ADDRESS_ADDED,
            "update_address": ResponseType.ADDRESS_UPDATED,
            "delete_address": ResponseType.ADDRESS_DELETED
        }
        
        if tool_name == "get_addresses":
            addresses = data if isinstance(data, list) else []
            return create_response(
                response_type=ResponseType.ADDRESSES_LIST,
                success=success,
                message=message,
                data={"addresses": addresses}
            )
        else:
            return create_response(
                response_type=response_type_map.get(tool_name, ResponseType.SUCCESS),
                success=success,
                message=message,
                data={"address": data} if data else None
            )
    
    @staticmethod
    def _map_auth_response(tool_name: str, success: bool, message: str, data: Any) -> BaseResponse:
        """Map authentication responses"""
        response_type_map = {
            "login_user": ResponseType.LOGIN_SUCCESS if success else ResponseType.LOGIN_FAILED,
            "register_user": ResponseType.REGISTRATION_SUCCESS if success else ResponseType.REGISTRATION_FAILED,
            "logout_user": ResponseType.LOGOUT_SUCCESS,
            "refresh_token": ResponseType.TOKEN_REFRESHED
        }
        
        return create_response(
            response_type=response_type_map.get(tool_name, ResponseType.SUCCESS),
            success=success,
            message=message,
            data={"auth": data} if data else None
        )
