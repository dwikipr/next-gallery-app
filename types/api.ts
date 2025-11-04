// Backend API types based on SnapSync Postman collection

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: number;
  user: User;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PublicImage {
  publicImageId: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface SavedImage {
  savedImageId: string;
  publicImageId: string;
  userId: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface SaveImageRequest {
  publicImageId: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
