import { ApiClient } from '../clients/api-client';
import { MCPTool } from '../types';
export declare class AuthTools {
    private apiClient;
    constructor(apiClient: ApiClient);
    getTools(): MCPTool[];
    executeTool(toolName: string, args: any): Promise<import("../types").AuthResponse | import("../types").ApiResponse<any>>;
}
//# sourceMappingURL=auth.tools.d.ts.map