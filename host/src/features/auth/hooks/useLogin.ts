import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService, authKeys } from "../services";
import { LoginCredentials } from "../types/auth.types";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      if (data?.token) {
        localStorage.setItem("auth_token", data.token);
      }
      if (data?.user) {
        queryClient.setQueryData(authKeys.user(), data.user);
      }
      navigate("/");
    },
  });
}

export default useLogin;
