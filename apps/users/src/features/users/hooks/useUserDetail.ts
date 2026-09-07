import { useQuery } from "@tanstack/react-query";
import { usersService, usersKeys } from "../services";
import { User } from "../types/users.types";

export function useUserDetail(id?: string | number) {
  return useQuery<User | null>({
    queryKey: usersKeys.detail(id ?? ""),
    queryFn: () => (id ? usersService.getById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

export default useUserDetail;
