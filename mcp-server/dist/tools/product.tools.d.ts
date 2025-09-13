import { ApiClient } from '../clients/api-client';
import { MCPTool } from '../types';
export declare class ProductTools {
    private apiClient;
    constructor(apiClient: ApiClient);
    getTools(): MCPTool[];
    executeTool(toolName: string, args: any): Promise<import("../types").ApiResponse<any>>;
}
//# sourceMappingURL=product.tools.d.ts.map