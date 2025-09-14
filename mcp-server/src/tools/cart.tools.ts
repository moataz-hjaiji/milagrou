import { ApiClient } from '../clients/api-client';
import { MCPTool } from '../types';

export class CartTools {
  constructor(private apiClient: ApiClient) {}

  getTools(): MCPTool[] {
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
        protected: true,
        inputSchema: {
          type: 'object',
          properties: {
            userId: { type: 'string', description: 'User ID' },
            productId: { type: 'string', description: 'Product ID to add' },
            quantity: { type: 'number', description: 'Quantity to add', default: 1 },
            deliveryType: { type: 'string', description: 'Delivery type - MUST be exactly "DELIVERY" or "PICKUP" (case-sensitive). Do NOT use "standard" or any other value.'}

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

  async executeTool(toolName: string, args: any) {
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

  private async getCart(userId: string) {
    try {
      const response = await this.apiClient.get(`/cart/${userId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get cart'
      };
    }
  }

  private async addToCart(userId: string, productId: string, quantity: number) {
    try {
      console.log(`Adding to cart`, {
        userId,
        productId,
        quantity
      });
      const response = await this.apiClient.post('/cart/add', {
        userId,
        productId,
        quantity
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to add item to cart'
      };
    }
  }

  private async removeFromCart(userId: string, productId: string) {
    try {
      const response = await this.apiClient.delete(`/cart/${userId}/item/${productId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to remove item from cart'
      };
    }
  }

  private async updateCartItem(userId: string, productId: string, quantity: number) {
    try {
      const response = await this.apiClient.put(`/cart/${userId}/item/${productId}`, {
        quantity
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update cart item'
      };
    }
  }

  private async clearCart(userId: string) {
    try {
      const response = await this.apiClient.delete(`/cart/${userId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to clear cart'
      };
    }
  }
}
