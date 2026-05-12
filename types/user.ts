// user types: описывает TypeScript-структуры данных для пользователей.
export interface User {
  uid: string;
  email?: string;
  phone?: string;
  displayName: string;
  createdAt?: string;
}

export type AppUserRole =
  | 'parent'
  | 'youth'
  | 'child'
  | 'young-adult'
  | 'mentor'
  | 'org'
  | 'teacher'
  | 'admin';

export type HomeScreenRole = AppUserRole;
export type ProfileScreenRole = Exclude<AppUserRole, 'admin'>;
