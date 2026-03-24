export const Role = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  LECTOR: 'LECTOR',
} as const;

export type Role = keyof typeof Role;
