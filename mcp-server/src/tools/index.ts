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
    return [
      ...this.authTools.getTools(),
      ...this.productTools.getTools(),
      ...this.cartTools.getTools(),
      ...this.orderTools.getTools(),
      ...this.userTools.getTools()
    ];
  }

  async executeTool(toolName: string, args: any) {
    // Determine which tool category to use
    if (toolName.startsWith('login_') || toolName.startsWith('register_') || 
        toolName.startsWith('logout_') || toolName.startsWith('refresh_')) {
      return await this.authTools.executeTool(toolName, args);
    }
    
    if (toolName.startsWith('get_product') || toolName.startsWith('search_product') || 
        toolName.startsWith('get_categor')) {
      return await this.productTools.executeTool(toolName, args);
    }
    
    if (toolName.startsWith('get_cart') || toolName.startsWith('add_to_cart') || 
        toolName.startsWith('remove_from_cart') || toolName.startsWith('update_cart') || 
        toolName.startsWith('clear_cart')) {
      return await this.cartTools.executeTool(toolName, args);
    }
    
    if (toolName.startsWith('get_order') || toolName.startsWith('create_order') || 
        toolName.startsWith('cancel_order') || toolName.startsWith('track_order')) {
      return await this.orderTools.executeTool(toolName, args);
    }
    
    if (toolName.startsWith('get_profile') || toolName.startsWith('update_profile') || 
        toolName.startsWith('get_address') || toolName.startsWith('add_address') || 
        toolName.startsWith('update_address') || toolName.startsWith('delete_address')) {
      return await this.userTools.executeTool(toolName, args);
    }
    
    throw new Error(`Unknown tool: ${toolName}`);
  }
}
