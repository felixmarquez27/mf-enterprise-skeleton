import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "../services";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      try {
        await authService.logout();
      } catch {
        // En caso de error de red o backend no disponible, se procede a limpiar la sesión local
      }
    },
    onSettled: () => {
      localStorage.removeItem("auth_token");
      queryClient.clear();
      navigate("/login");
    },
  });
}

export default useLogout;
