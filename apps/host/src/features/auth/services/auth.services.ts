import { apiClient } from "@/lib/axios";
import { AuthResponse, LoginCredentials, User } from "../types/auth.types";
import { getMockAuthResponse } from "../mocks/auth.mock";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Al conectar la API real, cambiar por:
    // const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
    // return response.data;
    return getMockAuthResponse();
  },

  async me(): Promise<User> {
    // Al conectar la API real, cambiar por:
    // const response = await apiClient.get<User>("/auth/me");
    // return response.data;
    return getMockAuthResponse().user;
  },

  async logout(): Promise<void> {
    // Al conectar la API real, cambiar por:
    // await apiClient.post("/auth/logout");
  },
};

export default authService;
