import { User, UserFilters, CreateUserPayload, UpdateUserPayload } from "../types/users.types";
import { getMockUsers, getMockUserById } from "../mocks/users.mock";

export const usersService = {
  async getAll(filters?: UserFilters): Promise<User[]> {
    // Al conectar la API real:
    // const response = await apiClient.get<User[]>("/users", { params: filters });
    // return response.data;
    return getMockUsers(filters);
  },

  async getById(id: string | number): Promise<User | null> {
    // Al conectar la API real:
    // const response = await apiClient.get<User>(`/users/${id}`);
    // return response.data;
    return getMockUserById(id);
  },

  async create(payload: CreateUserPayload): Promise<User> {
    // Al conectar la API real:
    // const response = await apiClient.post<User>("/users", payload);
    // return response.data;
    const newUser: User = {
      ...payload,
      id: `usr_${Date.now()}`,
      status: payload.status || "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    return newUser;
  },

  async update(payload: UpdateUserPayload): Promise<User> {
    // Al conectar la API real:
    // const response = await apiClient.put<User>(`/users/${payload.id}`, payload);
    // return response.data;
    const existing = await getMockUserById(payload.id);
    return {
      ...(existing || {}),
      ...payload,
    } as User;
  },

  async delete(_id: string | number): Promise<void> {
    // Al conectar la API real:
    // await apiClient.delete(`/users/${_id}`);
  },
};

export default usersService;
