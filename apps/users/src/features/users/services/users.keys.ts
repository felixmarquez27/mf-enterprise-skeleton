import { UserFilters } from "../types/users.types";

export const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (filters?: UserFilters) => [...usersKeys.lists(), filters ?? {}] as const,
  details: () => [...usersKeys.all, "detail"] as const,
  detail: (id: string | number) => [...usersKeys.details(), String(id)] as const,
};

export default usersKeys;
