// src/types/auth.types.ts

// Payload para registro
export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
}

// Payload para login
export type LoginPayload = Omit<CreateUserPayload, "name">;
