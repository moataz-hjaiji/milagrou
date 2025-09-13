"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const api_client_1 = require("./clients/api-client");
const index_1 = require("./tools/index");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
// Create API client
const apiClient = new api_client_1.ApiClient(API_BASE_URL);
// Create tool manager
const toolManager = new index_1.ToolManager(apiClient);
// Create MCP server
const server = new index_js_1.Server({
    name: 'ecommerce-mcp-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Handle tool listing
server.setRequestHandler('tools/list', async () => {
    const tools = toolManager.getAllTools();
    return { tools };
});
// Handle tool execution
server.setRequestHandler('tools/call', async (request) => {
    const { name, arguments: args } = request.params;
    try {
        console.log(`Executing tool: ${name} with args:`, args);
        const result = await toolManager.executeTool(name, args);
        console.log(`Tool ${name} executed successfully:`, result);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    catch (error) {
        console.error(`Error executing tool ${name}:`, error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: error.message || 'Unknown error occurred'
                    }, null, 2)
                }
            ],
            isError: true
        };
    }
});
// Handle ping
server.setRequestHandler('ping', async () => {
    return { message: 'pong' };
});
// Start the server
async function startServer() {
    try {
        const transport = new stdio_js_1.StdioServerTransport();
        await server.connect(transport);
        console.log('E-commerce MCP Server started successfully');
    }
    catch (error) {
        console.error('Failed to start MCP server:', error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down MCP server...');
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('Shutting down MCP server...');
    process.exit(0);
});
// Start the server
startServer();
//# sourceMappingURL=server.js.map