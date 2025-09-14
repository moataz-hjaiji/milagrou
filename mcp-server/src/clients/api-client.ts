import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, AuthResponse } from '../types';

export class ApiClient {
  private client: AxiosInstance;
  private authToken?: string;

  constructor(baseURL: string) {
    this.client = axios.create({
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
      console.log(`[ApiClient] Making request to: ${config.baseURL}${config.url}`);
      console.log(`[ApiClient] Request params:`, config.params);
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = undefined;
  }

  async get<T = any>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<any> = await this.client.get(endpoint, { params });
      
      if (response.data.statusCode && response.data.statusCode === 200) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'API returned error'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
      };
    }
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
      };
    }
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.put(endpoint, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
      };
    }
  }

  async delete<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(endpoint, { data });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
      };
    }
  }

  // Authentication methods
  async loginUser(phone: string, password: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/login/user', { phone, password });
    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }
    return response.data || response;
  }

  async registerUser(phone: string, name: string, email?: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/register', { phone, name, email });
    return response.data || response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.post('/auth/logout');
    this.clearAuthToken();
    return response;
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/refresh');
    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }
    return response.data || response;
  }
}
