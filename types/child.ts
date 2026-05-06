import type { Diagnostic } from '$types/diagnostic';

export type ChildAgeCategory = 'child' | 'teen' | 'young-adult';

export interface Child {
  id: string;
  parentId: string;
  name: string;
  phone?: string;
  age: number;
  ageCategory?: ChildAgeCategory;
  interests: string[];
  goals?: string;
  talentProfile?: Diagnostic;
  qrPin?: string;
  qrPinExpiresAt?: string | Date;
  qrPinOneTimeUse?: boolean;
  createdAt?: string;
}
