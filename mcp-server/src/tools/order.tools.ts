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
        description: 'Create new order from cart. All required fields must be provided.',
        inputSchema: {
          type: 'object',
          properties: {
            orderType: {
              type: 'string',
              enum: ['GIFT', 'RESERVATION', 'NORMAL'],
              description: 'Type of order - GIFT, RESERVATION, or NORMAL'
            },
            InvoicePaymentMethods: {
              type: 'array',
              items: { type: 'number' },
              description: 'Array of payment method IDs (required)',
              minItems: 1
            },
            deliveryType: { 
              type: 'string', 
              enum: ['DELIVERY', 'PICKUP'],
              description: 'Delivery type - MUST be exactly "DELIVERY" or "PICKUP"' 
            },
            
            // Optional but commonly used fields
            userId: { 
              type: 'string', 
              description: 'User ID (optional if using auth token)' 
            },
            addressId: { 
              type: 'string', 
              description: 'Address ID for delivery orders' 
            },
            firstName: { 
              type: 'string', 
              description: 'Customer first name' 
            },
            lastName: { 
              type: 'string', 
              description: 'Customer last name' 
            },
            phoneNumber: { 
              type: 'string', 
              description: 'Customer phone number' 
            },
            email: { 
              type: 'string', 
              description: 'Customer email' 
            },
            note: { 
              type: 'string', 
              description: 'Order notes (optional)' 
            },
            giftMsg: { 
              type: 'string', 
              description: 'Gift message (for GIFT orders)' 
            },
            code: { 
              type: 'string', 
              description: 'Promo/discount code (optional)' 
            },
            reservationDate: { 
              type: 'string', 
              format: 'date-time',
              description: 'Reservation date (for RESERVATION orders)' 
            },
            browserId: { 
              type: 'string', 
              description: 'Browser session ID for guest orders' 
            }
          },
          required: ['orderType', 'InvoicePaymentMethods', 'deliveryType']
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
        console.log('create_order called with args:', JSON.stringify(args, null, 2));
        
        // Validate required fields
        const errors = [];
        
        if (!args.orderType) {
          errors.push('orderType is required');
        } else if (!['GIFT', 'RESERVATION', 'NORMAL'].includes(args.orderType)) {
          errors.push('orderType must be GIFT, RESERVATION, or NORMAL');
        }
        
        if (!args.InvoicePaymentMethods || !Array.isArray(args.InvoicePaymentMethods) || args.InvoicePaymentMethods.length === 0) {
          errors.push('InvoicePaymentMethods is required and must be a non-empty array');
        }
        
        if (!args.deliveryType) {
          errors.push('deliveryType is required');
        } else if (!['DELIVERY', 'PICKUP'].includes(args.deliveryType)) {
          errors.push('deliveryType must be exactly "DELIVERY" or "PICKUP"');
        }
        
        // Validate conditional requirements
        if (args.orderType === 'RESERVATION' && !args.reservationDate) {
          errors.push('reservationDate is required for RESERVATION orders');
        }
        
        if (args.deliveryType === 'DELIVERY' && !args.addressId) {
          errors.push('addressId is required for DELIVERY orders');
        }
        
        if (errors.length > 0) {
          throw new Error(`Validation failed: ${errors.join(', ')}`);
        }
        
        console.log('Sending to API /orders/checkout:', JSON.stringify(args, null, 2));
        
        try {
          const result = await this.apiClient.post('/orders/checkout', args);
          console.log('API response:', JSON.stringify(result, null, 2));
          return result;
        } catch (error) {
          console.error('API call failed:', error);
          throw error;
        }
      
      case 'cancel_order':
        return await this.apiClient.delete(`/orders/${args.id}`);
      
      case 'track_order':
        return await this.apiClient.get(`/orders/${args.id}`);
      
      default:
        throw new Error(`Unknown order tool: ${toolName}`);
    }
  }
}
