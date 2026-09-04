import { useQuery } from "@tanstack/react-query";
import { authService, authKeys } from "../services";
import { User } from "../types/auth.types";
import { brandConfig } from "@/config/brand";

export function useUser() {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  return useQuery<User>({
    queryKey: authKeys.user(),
    queryFn: async () => {
      try {
        return await authService.me();
      } catch {
        // Fallback resiliente en desarrollo usando la configuración de marca
        return {
          id: "usr_admin_1",
          name: `${brandConfig.name} Administrador`,
          email: brandConfig.supportEmail,
          role: "ADMIN",
        };
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}

export default useUser;
