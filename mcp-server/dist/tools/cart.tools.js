"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartTools = void 0;
class CartTools {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    getTools() {
        return [
            {
                name: 'get_cart',
                description: 'Get user shopping cart',
                inputSchema: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string', description: 'User ID' }
                    },
                    required: ['userId']
                }
            },
            {
                name: 'add_to_cart',
                description: 'Add item to shopping cart',
                inputSchema: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string', description: 'User ID' },
                        productId: { type: 'string', description: 'Product ID to add' },
                        quantity: { type: 'number', description: 'Quantity to add', default: 1 }
                    },
                    required: ['userId', 'productId']
                }
            },
            {
                name: 'remove_from_cart',
                description: 'Remove item from shopping cart',
                inputSchema: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string', description: 'User ID' },
                        productId: { type: 'string', description: 'Product ID to remove' }
                    },
                    required: ['userId', 'productId']
                }
            },
            {
                name: 'update_cart_item',
                description: 'Update quantity of item in cart',
                inputSchema: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string', description: 'User ID' },
                        productId: { type: 'string', description: 'Product ID to update' },
                        quantity: { type: 'number', description: 'New quantity' }
                    },
                    required: ['userId', 'productId', 'quantity']
                }
            },
            {
                name: 'clear_cart',
                description: 'Clear all items from shopping cart',
                inputSchema: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string', description: 'User ID' }
                    },
                    required: ['userId']
                }
            }
        ];
    }
    async executeTool(toolName, args) {
        switch (toolName) {
            case 'get_cart':
                return await this.getCart(args.userId);
            case 'add_to_cart':
                return await this.addToCart(args.userId, args.productId, args.quantity || 1);
            case 'remove_from_cart':
                return await this.removeFromCart(args.userId, args.productId);
            case 'update_cart_item':
                return await this.updateCartItem(args.userId, args.productId, args.quantity);
            case 'clear_cart':
                return await this.clearCart(args.userId);
            default:
                throw new Error(`Unknown cart tool: ${toolName}`);
        }
    }
    async getCart(userId) {
        try {
            const response = await this.apiClient.get(`/cart/${userId}`);
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to get cart'
            };
        }
    }
    async addToCart(userId, productId, quantity) {
        try {
            const response = await this.apiClient.post('/cart/add', {
                userId,
                productId,
                quantity
            });
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to add item to cart'
            };
        }
    }
    async removeFromCart(userId, productId) {
        try {
            const response = await this.apiClient.delete(`/cart/${userId}/item/${productId}`);
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to remove item from cart'
            };
        }
    }
    async updateCartItem(userId, productId, quantity) {
        try {
            const response = await this.apiClient.put(`/cart/${userId}/item/${productId}`, {
                quantity
            });
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to update cart item'
            };
        }
    }
    async clearCart(userId) {
        try {
            const response = await this.apiClient.delete(`/cart/${userId}`);
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to clear cart'
            };
        }
    }
}
exports.CartTools = CartTools;
//# sourceMappingURL=cart.tools.js.map