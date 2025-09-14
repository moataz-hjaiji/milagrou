import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

class ResponseFormatter:
    """Handles formatting of tool responses for user-friendly display"""
    
    def __init__(self):
        logger.info("Response Formatter initialized")

    def format_tool_response(self, tool_name: str, data: Any) -> str:
        """Format tool response in a user-friendly way"""
        logger.info(f"📝 Formatting response for tool '{tool_name}'")
        logger.debug(f"Response data type: {type(data)}")
        
        if not data:
            logger.debug("Empty response data, returning default message")
            return "Request completed successfully."
            
        try:
            # Handle different response types based on tool
            if tool_name == 'login_user':
                logger.debug("Formatting login response")
                if isinstance(data, dict) and data.get('token'):
                    user = data.get('user', {})
                    name = user.get('name', 'User')
                    logger.info(f"✅ Login successful for user: {name}")
                    return f"Welcome back, {name}! You're now logged in."
                else:
                    logger.info("✅ Login successful (no detailed user info)")
                    return "Login successful!"
                    
            elif tool_name == 'register_user':
                logger.debug("Formatting registration response")
                if isinstance(data, dict) and data.get('user'):
                    user = data.get('user', {})
                    name = user.get('name', 'User')
                    logger.info(f"✅ Registration successful for user: {name}")
                    return f"Welcome {name}! Your account has been created successfully."
                else:
                    logger.info("✅ Registration successful")
                    return "Account created successfully!"
                    
            elif tool_name == 'get_products':
                logger.debug("Formatting products list response")
                if isinstance(data, dict) and 'products' in data:
                    products = data['products'][:5]  # Show first 5
                    if products:
                        response = f"Here are {len(products)} products:\n\n"
                        for i, product in enumerate(products, 1):
                            name = product.get('nameAng', 'Unknown Product')
                            price = product.get('price', 'N/A')
                            response += f"{i}. {name} - ${price}\n"
                        logger.info(f"✅ Formatted {len(products)} products")
                        return response
                    else:
                        logger.info("No products found in response")
                        return "No products found."
                        
            elif tool_name == 'search_products':
                logger.debug("Formatting search results response")
                products = []
                if isinstance(data, dict):
                    products = data.get('products', [])
                elif isinstance(data, list):
                    products = data
                    
                if products:
                    response = f"I found {len(products)} products:\n\n"
                    for i, product in enumerate(products[:5], 1):  # Show first 5
                        name = product.get('nameAng', 'Unknown Product')
                        price = product.get('price', 'N/A')
                        response += f"{i}. {name} - ${price}\n"
                    logger.info(f"✅ Formatted {len(products)} search results")
                    return response
                else:
                    logger.info("No products found in search results")
                    return "No products found matching your search."
                    
            elif tool_name == 'get_cart':
                logger.debug("Formatting cart response")
                if isinstance(data, dict) and 'items' in data:
                    items = data['items']
                    if items:
                        response = f"Your cart has {len(items)} items:\n\n"
                        total = 0
                        for item in items:
                            product = item.get('product', {})
                            name = product.get('nameAng', 'Unknown Product')
                            quantity = item.get('quantity', 1)
                            price = product.get('price', 0)
                            subtotal = quantity * price
                            total += subtotal
                            response += f"• {name} x{quantity} = ${subtotal:.2f}\n"
                        response += f"\nTotal: ${total:.2f}"
                        logger.info(f"✅ Formatted cart with {len(items)} items, total: ${total:.2f}")
                        return response
                    else:
                        logger.info("Cart is empty")
                        return "Your cart is empty."
                        
            elif tool_name == 'add_to_cart':
                logger.debug("Formatting add to cart response")
                if isinstance(data, dict) and data.get('success'):
                    product = data.get('product', {})
                    product_name = product.get('nameAng', 'item')
                    quantity = data.get('quantity', 1)
                    logger.info(f"✅ Added {quantity}x {product_name} to cart")
                    return f"Added {quantity}x {product_name} to your cart successfully!"
                else:
                    logger.info("✅ Item added to cart")
                    return "Item added to your cart successfully!"
                    
            elif tool_name == 'create_order':
                logger.debug("Formatting create order response")
                if isinstance(data, dict):
                    order_id = data.get('orderId') or data.get('_id') or data.get('id')
                    if order_id:
                        logger.info(f"✅ Order created successfully with ID: {order_id}")
                        return f"Order created successfully! Order ID: {order_id}"
                    elif data.get('success'):
                        logger.info("✅ Order created successfully")
                        return "Order created successfully!"
                        
            elif tool_name in ['get_orders', 'get_order']:
                logger.debug(f"Formatting {tool_name} response")
                if isinstance(data, dict):
                    if 'orders' in data:
                        orders = data['orders']
                        if orders:
                            response = f"Found {len(orders)} orders:\n\n"
                            for order in orders[:3]:  # Show first 3
                                order_id = order.get('_id', 'Unknown')
                                status = order.get('status', 'Unknown')
                                total = order.get('total', 0)
                                response += f"Order {order_id}: {status} - ${total}\n"
                            logger.info(f"✅ Formatted {len(orders)} orders")
                            return response
                    elif data.get('_id'):  # Single order
                        order_id = data.get('_id')
                        status = data.get('status', 'Unknown')
                        total = data.get('total', 0)
                        logger.info(f"✅ Formatted single order: {order_id}")
                        return f"Order {order_id}: Status - {status}, Total - ${total}"
            
            # Default: return JSON for complex responses
            if isinstance(data, (dict, list)):
                logger.debug("Using default JSON formatting")
                return json.dumps(data, indent=2)
            else:
                logger.debug("Converting response to string")
                return str(data)
                
        except Exception as e:
            logger.error(f"❌ Error formatting response for '{tool_name}': {e}")
            return f"Response received but formatting failed: {str(e)}"