import { ApiClient } from '../clients/api-client';
import { AuthTools } from './auth.tools';
import { ProductTools } from './product.tools';
import { CartTools } from './cart.tools';
import { OrderTools } from './order.tools';
import { UserTools } from './user.tools';
import { MCPTool } from '../types';

export class ToolManager {
  private authTools: AuthTools;
  private productTools: ProductTools;
  private cartTools: CartTools;
  private orderTools: OrderTools;
  private userTools: UserTools;

  constructor(apiClient: ApiClient) {
    this.authTools = new AuthTools(apiClient);
    this.productTools = new ProductTools(apiClient);
    this.cartTools = new CartTools(apiClient);
    this.orderTools = new OrderTools(apiClient);
    this.userTools = new UserTools(apiClient);
  }

  getAllTools(): MCPTool[] {
    const allTools = [
      ...this.authTools.getTools(),
      ...this.productTools.getTools(),
      ...this.cartTools.getTools(),
      ...this.orderTools.getTools(),
      ...this.userTools.getTools()
    ];
    
    console.log(`[MCP] Available tools (${allTools.length}):`, allTools.map(tool => tool.name));
    return allTools;
  }

  async executeTool(toolName: string, args: any) {
    console.log(`[MCP] Executing tool: ${toolName} with args:`, JSON.stringify(args, null, 2));
    
    try {
      let result;
      
      // Determine which tool category to use
      if (toolName.startsWith('login_') || toolName.startsWith('register_') || 
          toolName.startsWith('logout_') || toolName.startsWith('refresh_')) {
        console.log(`[MCP] Using AuthTools for: ${toolName}`);
        result = await this.authTools.executeTool(toolName, args);
      }
      else if (toolName.startsWith('get_product') || toolName.startsWith('search_product') || 
          toolName.startsWith('get_categor')) {
        console.log(`[MCP] Using ProductTools for: ${toolName}`);
        result = await this.productTools.executeTool(toolName, args);
      }
      else if (toolName.startsWith('get_cart') || toolName.startsWith('add_to_cart') || 
          toolName.startsWith('remove_from_cart') || toolName.startsWith('update_cart') || 
          toolName.startsWith('clear_cart')) {
        console.log(`[MCP] Using CartTools for: ${toolName}`);
        result = await this.cartTools.executeTool(toolName, args);
      }
      else if (toolName.startsWith('get_order') || toolName.startsWith('create_order') || 
          toolName.startsWith('cancel_order') || toolName.startsWith('track_order')) {
        console.log(`[MCP] Using OrderTools for: ${toolName}`);
        result = await this.orderTools.executeTool(toolName, args);
      }
      else if (toolName.startsWith('get_profile') || toolName.startsWith('update_profile') || 
          toolName.startsWith('get_address') || toolName.startsWith('add_address') || 
          toolName.startsWith('update_address') || toolName.startsWith('delete_address')) {
        console.log(`[MCP] Using UserTools for: ${toolName}`);
        result = await this.userTools.executeTool(toolName, args);
      }
      else {
        console.error(`[MCP] Unknown tool: ${toolName}`);
        throw new Error(`Unknown tool: ${toolName}`);
      }
      
      console.log(`[MCP] Tool ${toolName} executed successfully`);
      return result;
      
    } catch (error) {
      console.error(`[MCP] Error executing tool ${toolName}:`, error);
      throw error;
    }
  }
}
