import { ApiClient } from '../clients/api-client';
import { MCPTool } from '../types';
export declare class CartTools {
    private apiClient;
    constructor(apiClient: ApiClient);
    getTools(): MCPTool[];
    executeTool(toolName: string, args: any): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    private getCart;
    private addToCart;
    private removeFromCart;
    private updateCartItem;
    private clearCart;
}
//# sourceMappingURL=cart.tools.d.ts.map