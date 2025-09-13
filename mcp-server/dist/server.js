"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const tools_1 = require("./tools");
const api_client_1 = require("./clients/api-client");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.MCP_PORT || 3002;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize API client
const apiClient = new api_client_1.ApiClient(process.env.API_BASE_URL || 'http://ecommerce-api:3000/api');
// Initialize tool manager
const toolManager = new tools_1.ToolManager(apiClient);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'MCP Server is running' });
});
// Get available tools
app.get('/tools', (req, res) => {
    try {
        const tools = toolManager.getAllTools();
        res.json({ tools });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get tools' });
    }
});
// Execute tool endpoint
app.post('/execute', async (req, res) => {
    try {
        const { toolName, args } = req.body;
        if (!toolName) {
            return res.status(400).json({ error: 'Tool name is required' });
        }
        const result = await toolManager.executeTool(toolName, args);
        res.json({ result });
    }
    catch (error) {
        console.error('Tool execution error:', error);
        res.status(500).json({ error: 'Tool execution failed' });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(`MCP Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Available tools: http://localhost:${PORT}/tools`);
});
//# sourceMappingURL=server.js.map