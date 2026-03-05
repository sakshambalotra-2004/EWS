export type Role = 'admin' | 'faculty' | 'counselor' | 'student';

export type RiskLevel = 'high' | 'medium' | 'low';

export interface Student {
  id: number;
  name: string;
  dept: string;
  gpa: number;
  attendance: number;
  failed: number;
  risk: RiskLevel;
  score: number;
}

export interface AttendanceTrendEntry {
  week: string;
  CS: number;
  EE: number;
  ME: number;
  BBA: number;
}

export interface DeptRiskEntry {
  dept: string;
  high: number;
  medium: number;
  low: number;
}

export interface Intervention {
  id: number;
  student: string;
  type: string;
  status: 'Active' | 'Completed' | 'Scheduled';
  date: string;
}
