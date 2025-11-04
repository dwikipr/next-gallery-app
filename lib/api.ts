import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  User,
  PublicImage,
  SavedImage,
  SaveImageRequest,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Helper function to get auth headers
function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "*/*",
    "ngrok-skip-browser-warning": "true",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

// Auth endpoints
export async function signup(data: SignupRequest): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/signup`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Signup failed" }));
    throw new Error(error.message || "Signup failed");
  }

  const result = await response.json();
  return result.data || result;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Login failed" }));
    throw new Error(error.message || "Login failed");
  }

  const result = await response.json();
  return result.data || result;
}

// Images endpoints
export async function fetchImages(token: string): Promise<PublicImage[]> {
  const response = await fetch(`${API_BASE_URL}/images`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch images");
  }

  const result = await response.json();
  return result.data || result;
}

export async function fetchSavedImages(token: string): Promise<SavedImage[]> {
  const response = await fetch(`${API_BASE_URL}/saved-images`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch saved images");
  }

  const result = await response.json();
  return result.data || result;
}

export async function saveImage(
  token: string,
  data: SaveImageRequest
): Promise<SavedImage> {
  const response = await fetch(`${API_BASE_URL}/saved-images`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to save image" }));
    throw new Error(error.message || "Failed to save image");
  }

  const result = await response.json();
  return result.data || result;
}

export async function deleteSavedImage(
  token: string,
  savedImageId: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/saved-images/${savedImageId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error("Failed to delete saved image");
  }
}
