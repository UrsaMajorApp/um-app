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

export type HomeScreenRole = Exclude<AppUserRole, 'young-adult'>;
export type ProfileScreenRole = Exclude<AppUserRole, 'young-adult' | 'admin'>;
