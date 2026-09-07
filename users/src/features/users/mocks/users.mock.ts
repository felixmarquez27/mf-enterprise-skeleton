import { User, UserFilters } from "../types/users.types";

/**
 * Listado de usuarios corporativos mock con datos estructurados
 */
export const MOCK_USERS_DATA: User[] = [
  {
    id: "usr_101",
    name: "Carlos Gómez",
    email: "carlos.gomez@example.com.ar",
    role: "ADMIN",
    status: "ACTIVE",
    phone: "+54 11 4022-8811",
    department: "Infraestructura y Redes",
    createdAt: "2024-01-15T09:30:00Z",
  },
  {
    id: "usr_102",
    name: "Mariana Silva",
    email: "mariana.silva@example.com.ar",
    role: "OPERATOR",
    status: "ACTIVE",
    phone: "+54 11 4022-8822",
    department: "Soporte y Operaciones",
    createdAt: "2024-02-20T14:15:00Z",
  },
  {
    id: "usr_103",
    name: "Lucas Rossi",
    email: "lucas.rossi@example.com.ar",
    role: "AUDITOR",
    status: "ACTIVE",
    phone: "+54 11 4022-8833",
    department: "Auditoría y Compliance",
    createdAt: "2024-03-10T11:00:00Z",
  },
  {
    id: "usr_104",
    name: "Valentina Torres",
    email: "valentina.torres@example.com.ar",
    role: "OPERATOR",
    status: "PENDING",
    phone: "+54 11 4022-8844",
    department: "Atención al Cliente B2B",
    createdAt: "2024-05-04T16:45:00Z",
  },
  {
    id: "usr_105",
    name: "Federico Díaz",
    email: "federico.diaz@example.com.ar",
    role: "USER",
    status: "INACTIVE",
    phone: "+54 11 4022-8855",
    department: "Facturación y Cobranzas",
    createdAt: "2023-11-18T10:20:00Z",
  },
  {
    id: "usr_106",
    name: "Camila Benítez",
    email: "camila.benitez@example.com.ar",
    role: "ADMIN",
    status: "ACTIVE",
    phone: "+54 11 4022-8866",
    department: "Seguridad de la Información",
    createdAt: "2024-06-01T08:00:00Z",
  },
];

/**
 * Simula la respuesta asíncrona del servidor para listar usuarios
 */
export async function getMockUsers(filters?: UserFilters): Promise<User[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let results = [...MOCK_USERS_DATA];

  if (filters?.search) {
    const term = filters.search.toLowerCase();
    results = results.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.department && u.department.toLowerCase().includes(term))
    );
  }

  if (filters?.role && filters.role !== "ALL") {
    results = results.filter((u) => u.role === filters.role);
  }

  if (filters?.status && filters.status !== "ALL") {
    results = results.filter((u) => u.status === filters.status);
  }

  return results;
}

/**
 * Simula la respuesta asíncrona del servidor para obtener un usuario por ID
 */
export async function getMockUserById(id: string | number): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const user = MOCK_USERS_DATA.find((u) => String(u.id) === String(id));
  return user || null;
}
