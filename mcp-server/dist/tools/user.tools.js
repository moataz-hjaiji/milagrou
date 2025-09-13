"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTools = void 0;
class UserTools {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    getTools() {
        return [
            {
                name: 'get_profile',
                description: 'Get current user profile',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'update_profile',
                description: 'Update user profile',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'User name' },
                        email: { type: 'string', description: 'User email' },
                        avatar: { type: 'string', description: 'Avatar URL' }
                    }
                }
            },
            {
                name: 'get_addresses',
                description: 'Get user addresses',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'add_address',
                description: 'Add new address',
                inputSchema: {
                    type: 'object',
                    properties: {
                        street: { type: 'string', description: 'Street address' },
                        city: { type: 'string', description: 'City' },
                        state: { type: 'string', description: 'State' },
                        zipCode: { type: 'string', description: 'ZIP code' },
                        country: { type: 'string', description: 'Country' },
                        isDefault: { type: 'boolean', description: 'Set as default address' }
                    },
                    required: ['street', 'city', 'state', 'zipCode', 'country']
                }
            },
            {
                name: 'update_address',
                description: 'Update existing address',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'Address ID' },
                        street: { type: 'string', description: 'Street address' },
                        city: { type: 'string', description: 'City' },
                        state: { type: 'string', description: 'State' },
                        zipCode: { type: 'string', description: 'ZIP code' },
                        country: { type: 'string', description: 'Country' },
                        isDefault: { type: 'boolean', description: 'Set as default address' }
                    },
                    required: ['id']
                }
            },
            {
                name: 'delete_address',
                description: 'Delete address',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'Address ID to delete' }
                    },
                    required: ['id']
                }
            }
        ];
    }
    async executeTool(toolName, args) {
        switch (toolName) {
            case 'get_profile':
                return await this.apiClient.get('/users/me');
            case 'update_profile':
                return await this.apiClient.put('/users/me', args);
            case 'get_addresses':
                return await this.apiClient.get('/addresses');
            case 'add_address':
                return await this.apiClient.post('/addresses', args);
            case 'update_address':
                return await this.apiClient.put(`/addresses/${args.id}`, args);
            case 'delete_address':
                return await this.apiClient.delete(`/addresses/${args.id}`);
            default:
                throw new Error(`Unknown user tool: ${toolName}`);
        }
    }
}
exports.UserTools = UserTools;
//# sourceMappingURL=user.tools.js.map