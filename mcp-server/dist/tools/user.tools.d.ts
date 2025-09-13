import { ApiClient } from '../clients/api-client';
import { MCPTool } from '../types';
export declare class UserTools {
    private apiClient;
    constructor(apiClient: ApiClient);
    getTools(): MCPTool[];
    executeTool(toolName: string, args: any): Promise<import("../types").ApiResponse<any>>;
}
//# sourceMappingURL=user.tools.d.ts.map