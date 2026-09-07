import { useQuery } from "@tanstack/react-query";
import { usersService, usersKeys } from "../services";
import { User, UserFilters } from "../types/users.types";

export function useUsers(filters?: UserFilters) {
  return useQuery<User[]>({
    queryKey: usersKeys.list(filters),
    queryFn: () => usersService.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
  });
}

export default useUsers;
