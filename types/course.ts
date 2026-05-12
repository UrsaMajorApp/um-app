// course types: описывает TypeScript-структуры данных для курсов.
export type CourseSkill = {
  name: string;
  value: number;
};

export interface Course {
  id: string | number;
  organizationId?: string;
  title: string;
  tag?: string;
  icon?: string;
  gradient?: string[];
  shortDescription?: string;
  description: string;
  age?: string;
  level: string;
  format?: string;
  duration?: string;
  price: number | string;
  skills?: string | CourseSkill[];
  status?: 'active' | 'draft' | 'archived' | string;
}
