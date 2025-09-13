"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
class ApiClient {
    constructor(baseURL) {
        this.client = axios_1.default.create({
            baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Add request interceptor to include auth token
        this.client.interceptors.request.use((config) => {
            if (this.authToken) {
                config.headers.Authorization = `Bearer ${this.authToken}`;
            }
            return config;
        });
        // Add response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            console.error('API Error:', error.response?.data || error.message);
            throw error;
        });
    }
    setAuthToken(token) {
        this.authToken = token;
    }
    clearAuthToken() {
        this.authToken = undefined;
    }
    async get(endpoint, params) {
        try {
            const response = await this.client.get(endpoint, { params });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Unknown error',
            };
        }
    }
    async post(endpoint, data) {
        try {
            const response = await this.client.post(endpoint, data);
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Unknown error',
            };
        }
    }
    async put(endpoint, data) {
        try {
            const response = await this.client.put(endpoint, data);
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Unknown error',
            };
        }
    }
    async delete(endpoint) {
        try {
            const response = await this.client.delete(endpoint);
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Unknown error',
            };
        }
    }
    // Authentication methods
    async loginUser(phone, password) {
        const response = await this.post('/auth/login/user', { phone, password });
        if (response.success && response.data?.token) {
            this.setAuthToken(response.data.token);
        }
        return response.data || response;
    }
    async registerUser(phone, name, email) {
        const response = await this.post('/auth/register', { phone, name, email });
        return response.data || response;
    }
    async logout() {
        const response = await this.post('/auth/logout');
        this.clearAuthToken();
        return response;
    }
    async refreshToken() {
        const response = await this.post('/auth/refresh');
        if (response.success && response.data?.token) {
            this.setAuthToken(response.data.token);
        }
        return response.data || response;
    }
}
exports.ApiClient = ApiClient;
//# sourceMappingURL=api-client.js.map