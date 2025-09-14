from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic.v1 import BaseModel, Field

class ResponseType(str, Enum):
    """Enum for different types of responses from the ecommerce agent"""
    
    # Product related responses
    PRODUCTS_LIST = "products_list"
    PRODUCT_DETAILS = "product_details"
    PRODUCT_SEARCH = "product_search"
    CATEGORIES_LIST = "categories_list"
    CATEGORY_DETAILS = "category_details"
    
    # Cart related responses
    CART_VIEW = "cart_view"
    CART_ADDED = "cart_added"
    CART_UPDATED = "cart_updated"
    CART_REMOVED = "cart_removed"
    CART_CLEARED = "cart_cleared"
    
    # Order related responses
    ORDERS_LIST = "orders_list"
    ORDER_DETAILS = "order_details"
    ORDER_CREATED = "order_created"
    ORDER_CANCELLED = "order_cancelled"
    ORDER_TRACKING = "order_tracking"
    
    # User related responses
    USER_PROFILE = "user_profile"
    USER_UPDATED = "user_updated"
    ADDRESSES_LIST = "addresses_list"
    ADDRESS_ADDED = "address_added"
    ADDRESS_UPDATED = "address_updated"
    ADDRESS_DELETED = "address_deleted"
    
    # Authentication responses
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    REGISTRATION_SUCCESS = "registration_success"
    REGISTRATION_FAILED = "registration_failed"
    LOGOUT_SUCCESS = "logout_success"
    TOKEN_REFRESHED = "token_refreshed"
    
    # Error responses
    ERROR = "error"
    NOT_FOUND = "not_found"
    VALIDATION_ERROR = "validation_error"
    UNAUTHORIZED = "unauthorized"
    FORBIDDEN = "forbidden"
    
    # General responses
    SUCCESS = "success"
    INFO = "info"
    WARNING = "warning"

class BaseResponse(BaseModel):
    """Base response model for all agent responses"""
    response_type: ResponseType
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

def create_response(
    response_type: ResponseType,
    success: bool = True,
    message: str = "",
    data: Optional[Dict[str, Any]] = None,
    error: Optional[str] = None,
    **kwargs
) -> BaseResponse:
    """Factory function to create appropriate response based on type"""
    
    response_data = {
        "response_type": response_type,
        "success": success,
        "message": message,
        "data": data,
        "error": error,
        **kwargs
    }
    
    return BaseResponse(**response_data)
