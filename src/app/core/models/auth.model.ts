export interface LoginRequest {
  email: string;
  password: string;
}

export interface NewUserRequest {
  email: string;
  password: string;
  name: string;
}

export interface TokenResponse {
  access_token: string;   // <-- snake_case para match con backend Java
  refresh_token: string;  // <-- snake_case para match con backend Java
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
}