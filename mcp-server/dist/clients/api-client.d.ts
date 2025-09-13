import { ApiResponse, AuthResponse } from '../types';
export declare class ApiClient {
    private client;
    private authToken?;
    constructor(baseURL: string);
    setAuthToken(token: string): void;
    clearAuthToken(): void;
    get<T = any>(endpoint: string, params?: any): Promise<ApiResponse<T>>;
    post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
    put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
    delete<T = any>(endpoint: string): Promise<ApiResponse<T>>;
    loginUser(phone: string, password: string): Promise<AuthResponse>;
    registerUser(phone: string, name: string, email?: string): Promise<AuthResponse>;
    logout(): Promise<ApiResponse>;
    refreshToken(): Promise<AuthResponse>;
}
//# sourceMappingURL=api-client.d.ts.map