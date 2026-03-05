import type { Student, AttendanceTrendEntry, DeptRiskEntry, Intervention } from '../types';

export const STUDENTS: Student[] = [
  { id: 1,  name: 'Aisha Rahman',    dept: 'CS',  gpa: 1.8, attendance: 52, failed: 3, risk: 'high',   score: 87 },
  { id: 2,  name: 'Marco Silva',     dept: 'EE',  gpa: 2.1, attendance: 61, failed: 2, risk: 'high',   score: 79 },
  { id: 3,  name: 'Priya Nair',      dept: 'ME',  gpa: 2.6, attendance: 70, failed: 1, risk: 'medium', score: 58 },
  { id: 4,  name: 'James Okafor',    dept: 'CS',  gpa: 2.9, attendance: 74, failed: 1, risk: 'medium', score: 52 },
  { id: 5,  name: 'Lin Wei',         dept: 'BBA', gpa: 3.4, attendance: 85, failed: 0, risk: 'low',    score: 22 },
  { id: 6,  name: 'Sara Johnson',    dept: 'EE',  gpa: 1.6, attendance: 48, failed: 4, risk: 'high',   score: 91 },
  { id: 7,  name: 'Ahmed Hassan',    dept: 'ME',  gpa: 3.1, attendance: 80, failed: 0, risk: 'low',    score: 18 },
  { id: 8,  name: 'Fatima Al-Zahra', dept: 'BBA', gpa: 2.7, attendance: 68, failed: 1, risk: 'medium', score: 55 },
  { id: 9,  name: 'David Kim',       dept: 'CS',  gpa: 3.7, attendance: 92, failed: 0, risk: 'low',    score: 9  },
  { id: 10, name: 'Elena Petrova',   dept: 'ME',  gpa: 2.2, attendance: 59, failed: 2, risk: 'high',   score: 76 },
];

export const ATTENDANCE_TREND: AttendanceTrendEntry[] = [
  { week: 'W1', CS: 88, EE: 82, ME: 79, BBA: 91 },
  { week: 'W2', CS: 84, EE: 80, ME: 75, BBA: 89 },
  { week: 'W3', CS: 79, EE: 76, ME: 71, BBA: 85 },
  { week: 'W4', CS: 74, EE: 72, ME: 68, BBA: 82 },
  { week: 'W5', CS: 70, EE: 68, ME: 64, BBA: 80 },
  { week: 'W6', CS: 66, EE: 65, ME: 61, BBA: 77 },
];

export const DEPT_RISK: DeptRiskEntry[] = [
  { dept: 'CS',  high: 2, medium: 1, low: 1 },
  { dept: 'EE',  high: 2, medium: 0, low: 1 },
  { dept: 'ME',  high: 1, medium: 1, low: 1 },
  { dept: 'BBA', high: 0, medium: 1, low: 1 },
];

export const INTERVENTIONS: Intervention[] = [
  { id: 1, student: 'Aisha Rahman',  type: 'Academic Counseling', status: 'Active',    date: '2025-02-10' },
  { id: 2, student: 'Sara Johnson',  type: 'Parent Notification', status: 'Completed', date: '2025-02-08' },
  { id: 3, student: 'Marco Silva',   type: 'Tutoring Session',    status: 'Scheduled', date: '2025-02-15' },
  { id: 4, student: 'Elena Petrova', type: 'Academic Counseling', status: 'Active',    date: '2025-02-12' },
];

export const PIE_COLORS: Record<string, string> = {
  high:   '#ef4444',
  medium: '#f97316',
  low:    '#10b981',
};

// The current student logged in (student role view)
export const CURRENT_STUDENT = STUDENTS[4]; // Lin Wei
