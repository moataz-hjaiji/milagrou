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
    
    // User info is available as req.user from the auth middleware
    const user = (req as any).user;
    console.log(`Tool execution request from user: ${user.email} (ID: ${user.id})`);
    
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
