"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthTools = void 0;
class AuthTools {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    getTools() {
        return [
            {
                name: 'login_user',
                description: 'Login user with phone and password',
                inputSchema: {
                    type: 'object',
                    properties: {
                        phone: { type: 'string', description: 'User phone number' },
                        password: { type: 'string', description: 'User password' }
                    },
                    required: ['phone', 'password']
                }
            },
            {
                name: 'register_user',
                description: 'Register a new user',
                inputSchema: {
                    type: 'object',
                    properties: {
                        phone: { type: 'string', description: 'User phone number' },
                        name: { type: 'string', description: 'User full name' },
                        email: { type: 'string', description: 'User email (optional)' }
                    },
                    required: ['phone', 'name']
                }
            },
            {
                name: 'logout_user',
                description: 'Logout current user',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'refresh_token',
                description: 'Refresh authentication token',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            }
        ];
    }
    async executeTool(toolName, args) {
        switch (toolName) {
            case 'login_user':
                return await this.apiClient.loginUser(args.phone, args.password);
            case 'register_user':
                return await this.apiClient.registerUser(args.phone, args.name, args.email);
            case 'logout_user':
                return await this.apiClient.logout();
            case 'refresh_token':
                return await this.apiClient.refreshToken();
            default:
                throw new Error(`Unknown auth tool: ${toolName}`);
        }
    }
}
exports.AuthTools = AuthTools;
//# sourceMappingURL=auth.tools.js.map