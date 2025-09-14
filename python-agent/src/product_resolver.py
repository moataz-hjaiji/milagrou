import logging
from typing import Dict, Any, Optional
from http_mcp_client import HTTPMCPClient

logger = logging.getLogger(__name__)

class ProductResolver:
    """Handles product reference resolution (e.g., product names to IDs)"""
    
    def __init__(self, mcp_client: HTTPMCPClient):
        self.mcp_client = mcp_client
        logger.info("Product Resolver initialized")

    async def resolve_product_references(self, params: Dict[str, Any], user_token: Optional[str] = None) -> Dict[str, Any]:
        """Resolve product queries to product IDs"""
        logger.info(f"🔍 Resolving product references in parameters: {params}")
        
        resolved_params = params.copy()
        
        # Handle product_query -> productId conversion
        if 'product_query' in params:
            logger.info(f"🔎 Searching for product with query: '{params['product_query']}'")
            
            try:
                search_response = await self.mcp_client.execute_tool(
                    'search_products', 
                    {'query': params['product_query']},
                    user_token=user_token
                )
                
                logger.debug(f"Search response: {search_response}")
                
                if search_response.success and search_response.data:
                    # Handle different response formats
                    products = []
                    if isinstance(search_response.data, dict):
                        products = search_response.data.get('products', [])
                        # Also check for direct product list
                        if not products and isinstance(search_response.data, list):
                            products = search_response.data
                    elif isinstance(search_response.data, list):
                        products = search_response.data
                    
                    logger.debug(f"Found {len(products)} products")
                    
                    if products:
                        # Take the first matching product
                        first_product = products[0]
                        product_id = first_product.get('_id') or first_product.get('id')
                        
                        if product_id:
                            resolved_params['productId'] = product_id
                            del resolved_params['product_query']
                            
                            product_name = first_product.get('nameAng') or first_product.get('name', 'Unknown Product')
                            logger.info(f"✅ Resolved product query '{params['product_query']}' to ID '{product_id}' ({product_name})")
                        else:
                            logger.error(f"❌ Product found but no ID available: {first_product}")
                            return {'error': f"Found product but couldn't extract ID for '{params['product_query']}'"}
                    else:
                        logger.warning(f"❌ No products found matching '{params['product_query']}'")
                        return {'error': f"No products found matching '{params['product_query']}'"}
                else:
                    error_msg = search_response.error if not search_response.success else "No search results"
                    logger.error(f"❌ Product search failed: {error_msg}")
                    return {'error': f"Product search failed: {error_msg}"}
                        
            except Exception as e:
                logger.error(f"❌ Failed to search for product '{params['product_query']}': {e}")
                return {'error': f"Failed to search for product: {str(e)}"}
        
        logger.info(f"✅ Product reference resolution completed: {resolved_params}")
        return resolved_params