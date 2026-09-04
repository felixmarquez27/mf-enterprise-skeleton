import { useUser } from "./useUser";
import { useLogout } from "./useLogout";

export function useAuth() {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const { data: user, isLoading: isUserLoading, refetch } = useUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const isAuthenticated = Boolean(token);
  const isLoading = isAuthenticated && isUserLoading;

  return {
    user: user ?? null,
    token,
    isAuthenticated,
    isLoading,
    isLoggingOut,
    logout,
    refetchUser: refetch,
  };
}

export default useAuth;
