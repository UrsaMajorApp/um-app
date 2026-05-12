// attendance types: описывает TypeScript-структуры данных для посещаемости.
export type AttendanceStatus = 'present' | 'absent' | 'sick' | null;

export interface AttendanceStudentRow {
  id: string;
  name: string;
  age: number | null;
  status: AttendanceStatus;
}
