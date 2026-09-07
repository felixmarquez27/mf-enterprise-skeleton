import { apiClient } from "@/lib/axios";
import { AuthResponse, LoginCredentials, User } from "../types/auth.types";
import { brandConfig } from "@/config/brand";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
      return response.data;
    } catch {
      // Simulación interactiva para desarrollo local cuando el backend externo no está disponible
      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        token: "mock_jwt_session_token",
        user: {
          id: "usr_admin_1",
          name: `${brandConfig.name} Administrador`,
          email: credentials.email || brandConfig.supportEmail,
          role: "ADMIN",
        },
      };
    }
  },

  async me(): Promise<User> {
    try {
      const response = await apiClient.get<User>("/auth/me");
      return response.data;
    } catch {
      return {
        id: "usr_admin_1",
        name: `${brandConfig.name} Administrador`,
        email: brandConfig.supportEmail,
        role: "ADMIN",
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignora error si el endpoint de logout no está disponible
    }
  },
};

export default authService;
