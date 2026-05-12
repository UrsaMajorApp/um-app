// auth types: описывает TypeScript-структуры данных для авторизации.
export type AuthMethod = 'phone' | 'email';

export type QRScanResult = {
  id: string;
};

export type SubscriptionRole = 'parent' | 'youth' | 'child' | 'young-adult' | 'org' | 'mentor';
