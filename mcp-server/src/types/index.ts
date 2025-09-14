export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  role: 'user' | 'admin';
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  category: string;
  isActive: boolean;
  stock: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

// Auth service token verification response
export interface TokenVerifyResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    roles: string[];
    is_active: boolean;
  };
  error?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  protected?: boolean; 
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}
