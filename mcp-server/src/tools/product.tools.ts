import { ApiClient } from '../clients/api-client';
import { MCPTool } from '../types';

export class ProductTools {
  constructor(private apiClient: ApiClient) {}

  getTools(): MCPTool[] {
    return [
      {
        name: 'get_products',
        description: 'Get all products with optional filters',
        inputSchema: {
          type: 'object',
          properties: {
            page: { type: 'number', description: 'Page number for pagination' },
            limit: { type: 'number', description: 'Number of products per page' },
            category: { type: 'string', description: 'Filter by category' },
            search: { type: 'string', description: 'Search term for products' },
            minPrice: { type: 'number', description: 'Minimum price filter' },
            maxPrice: { type: 'number', description: 'Maximum price filter' }
          }
        }
      },
      {
        name: 'get_product',
        description: 'Get single product by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Product ID' }
          },
          required: ['id']
        }
      },
      {
        name: 'search_products',
        description: 'Search products by name or description',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            limit: { type: 'number', description: 'Maximum number of results' }
          },
          required: ['query']
        }
      },
      {
        name: 'get_categories',
        description: 'Get all product categories',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_category',
        description: 'Get single category by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Category ID' }
          },
          required: ['id']
        }
      }
    ];
  }

  async executeTool(toolName: string, args: any) {
    switch (toolName) {
      case 'get_products':
        return await this.apiClient.get('/products', args);
      
      case 'get_product':
        return await this.apiClient.get(`/products/${args.id}`);
      
      case 'search_products':
        return await this.apiClient.get('/products', { search: args.query, limit: args.limit });
      
      case 'get_categories':
        return await this.apiClient.get('/categories');
      
      case 'get_category':
        return await this.apiClient.get(`/categories/${args.id}`);
      
      default:
        throw new Error(`Unknown product tool: ${toolName}`);
    }
  }
}
