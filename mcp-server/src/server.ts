import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { ToolManager } from './tools';
import { ApiClient } from './clients/api-client';
import { TokenVerifyResponse } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.MCP_PORT || 3002;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:8000';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize API client
const apiClient = new ApiClient(process.env.API_BASE_URL || 'http://ecommerce-api:3000/api');

// Initialize tool manager
const toolManager = new ToolManager(apiClient);

// Auth middleware function
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header with Bearer token is required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Call auth service to verify token
    const verifyResponse = await axios.post<TokenVerifyResponse>(
      `${AUTH_SERVICE_URL}/auth/verify`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    const { valid, user, error } = verifyResponse.data;

    if (!valid) {
      return res.status(401).json({ error: error || 'Invalid token' });
    }
    
    // Add user info to request object for use in route handlers
    (req as any).user = user;
    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Authentication service unavailable' });
    }
    
    return res.status(401).json({ error: 'Token validation failed' });
  }
};

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

// Execute tool endpoint - now protected with authentication
app.post('/execute', authenticateToken, async (req, res) => {
  try {
    const { toolName, args } = req.body;
    
    if (!toolName) {
      return res.status(400).json({ error: 'Tool name is required' });
    }
    
    const user = (req as any).user;
    console.log(`Tool execution request from user: ${user.email} (ID: ${user.id})`);
    
    // Add user context to args only for tools that need it
    let argsWithUser = { ...(args || {}) } as Record<string, any>;
    
    // Only add user context for tools that require it
    if (toolName.startsWith('get_cart') || toolName.startsWith('add_to_cart') || 
        toolName.startsWith('remove_from_cart') || toolName.startsWith('update_cart') || 
        toolName.startsWith('clear_cart') || toolName.startsWith('get_order') || 
        toolName.startsWith('create_order') || toolName.startsWith('get_profile') || 
        toolName.startsWith('update_profile') || toolName.startsWith('get_address') || 
        toolName.startsWith('add_address') || toolName.startsWith('update_address') || 
        toolName.startsWith('delete_address')) {
      // Prefer provided userId, fallback to authenticated user
      argsWithUser = {
        ...argsWithUser,
        userId: argsWithUser.userId || user.id
        // Do NOT include userEmail here; it is not part of most tool schemas and can break downstream APIs
      };
    }

    // Schema-based filtering: only forward properties defined in the tool's inputSchema
    try {
      const allTools = toolManager.getAllTools();
      const toolDef = allTools.find(t => t.name === toolName);
      const allowedProps = Object.keys((toolDef as any)?.inputSchema?.properties || {});
      if (allowedProps.length > 0) {
        argsWithUser = Object.fromEntries(
          Object.entries(argsWithUser).filter(([key]) => allowedProps.includes(key))
        );
      }
    } catch (e) {
      console.warn('Schema-based arg filtering failed; proceeding without filtering', e);
    }
    
    const result = await toolManager.executeTool(toolName, argsWithUser);
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
