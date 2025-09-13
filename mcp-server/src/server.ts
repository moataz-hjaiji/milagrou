import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ToolManager } from './tools';
import { ApiClient } from './clients/api-client';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.MCP_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize API client
const apiClient = new ApiClient(process.env.API_BASE_URL || 'http://ecommerce-api:3000/api');

// Initialize tool manager
const toolManager = new ToolManager(apiClient);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MCP Server is running' });
});

// Get available tools
app.get('/tools', (req, res) => {
  try {
    const tools = toolManager.getAllTools();
    res.json({ tools });
  } catch (error) {
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
  } catch (error) {
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
