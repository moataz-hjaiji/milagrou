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
                description: 'Get user\'s shopping cart',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'add_to_cart',
                description: 'Add product to cart',
                inputSchema: {
                    type: 'object',
                    properties: {
                        productId: { type: 'string', description: 'Product ID to add' },
                        quantity: { type: 'number', description: 'Quantity to add' }
                    },
                    required: ['productId', 'quantity']
                }
            },
            {
                name: 'remove_from_cart',
                description: 'Remove product from cart',
                inputSchema: {
                    type: 'object',
                    properties: {
                        productId: { type: 'string', description: 'Product ID to remove' }
                    },
                    required: ['productId']
                }
            },
            {
                name: 'update_cart_item',
                description: 'Update quantity of item in cart',
                inputSchema: {
                    type: 'object',
                    properties: {
                        productId: { type: 'string', description: 'Product ID to update' },
                        quantity: { type: 'number', description: 'New quantity' }
                    },
                    required: ['productId', 'quantity']
                }
            },
            {
                name: 'clear_cart',
                description: 'Clear all items from cart',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            }
        ];
    }
    async executeTool(toolName, args) {
        switch (toolName) {
            case 'get_cart':
                return await this.apiClient.post('/carts/me');
            case 'add_to_cart':
                return await this.apiClient.post('/carts/add', args);
            case 'remove_from_cart':
                return await this.apiClient.delete('/carts/remove', { data: args });
            case 'update_cart_item':
                return await this.apiClient.put('/carts/edit', args);
            case 'clear_cart':
                return await this.apiClient.delete('/carts/clear');
            default:
                throw new Error(`Unknown cart tool: ${toolName}`);
        }
    }
}
exports.CartTools = CartTools;
//# sourceMappingURL=cart.tools.js.map