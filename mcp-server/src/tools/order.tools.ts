import { ApiClient } from '../clients/api-client';
import { MCPTool } from '../types';

export class OrderTools {
  constructor(private apiClient: ApiClient) {}

  getTools(): MCPTool[] {
    return [
      {
        name: 'get_orders',
        description: 'Get user\'s orders',
        inputSchema: {
          type: 'object',
          properties: {
            page: { type: 'number', description: 'Page number for pagination' },
            limit: { type: 'number', description: 'Number of orders per page' },
            status: { type: 'string', description: 'Filter by order status' }
          }
        }
      },
      {
        name: 'get_order',
        description: 'Get single order by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Order ID' }
          },
          required: ['id']
        }
      },
      {
        name: 'create_order',
        description: 'Create new order from cart',
        inputSchema: {
          type: 'object',
          properties: {
            shippingAddress: { type: 'string', description: 'Shipping address ID' },
            paymentMethod: { type: 'string', description: 'Payment method' },
            promoCode: { type: 'string', description: 'Promo code (optional)' },
            deliveryType: { type: 'string', description: 'must be a DELIVERY or PICKUP' }
          },
          required: ['shippingAddress', 'paymentMethod', 'deliveryType']
        }
      },
      {
        name: 'cancel_order',
        description: 'Cancel an order',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Order ID to cancel' }
          },
          required: ['id']
        }
      },
      {
        name: 'track_order',
        description: 'Track order status',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Order ID to track' }
          },
          required: ['id']
        }
      }
    ];
  }

  async executeTool(toolName: string, args: any) {
    switch (toolName) {
      case 'get_orders':
        return await this.apiClient.get('/orders', args);
      
      case 'get_order':
        return await this.apiClient.get(`/orders/${args.id}`);
      
      case 'create_order':
        return await this.apiClient.post('/orders/checkout', args);
      
      case 'cancel_order':
        return await this.apiClient.delete(`/orders/${args.id}`);
      
      case 'track_order':
        return await this.apiClient.get(`/orders/${args.id}`);
      
      default:
        throw new Error(`Unknown order tool: ${toolName}`);
    }
  }
}
