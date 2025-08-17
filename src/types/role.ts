// src/types/role.ts
export enum Role {
  MANAGER = "MANAGER",
  CAREWORKER = "CAREWORKER"
}

export type UserRole = keyof typeof Role;