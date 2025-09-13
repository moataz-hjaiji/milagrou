import { ApiClient } from '../clients/api-client';
import { MCPTool } from '../types';
export declare class ToolManager {
    private authTools;
    private productTools;
    private cartTools;
    private orderTools;
    private userTools;
    constructor(apiClient: ApiClient);
    getAllTools(): MCPTool[];
    executeTool(toolName: string, args: any): Promise<import("../types").AuthResponse | import("../types").ApiResponse<any>>;
}
//# sourceMappingURL=index.d.ts.map