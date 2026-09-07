import { useQuery } from "@tanstack/react-query";
import { authService, authKeys } from "../services";
import { User } from "../types/auth.types";

export function useUser() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  return useQuery<User>({
    queryKey: authKeys.user(),
    queryFn: () => authService.me(),
    enabled: !!token,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}

export default useUser;
