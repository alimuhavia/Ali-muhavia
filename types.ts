export enum StudentStatus {
  Active = 'Active',
  Left = 'Left',
  Suspended = 'Suspended',
  Completed = 'Completed'
}

export enum FeeStatus {
  Paid = 'Paid',
  Pending = 'Pending',
  Overdue = 'Overdue'
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  photoUrl: string;
  status: StudentStatus;
  joinDate: string;
  feeStatus: FeeStatus;
  lastPaymentDate: string;
  feeAmount: number;
  contactNumber: string;
  attendanceRate: number; // 0-100
}

export interface AttendanceLog {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: string; // ISO string
  type: 'ENTRY' | 'EXIT';
  isLate?: boolean;
  isEarlyExit?: boolean;
  snapshotUrl?: string; // For security logs
}

export interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateArrivals: number;
  earlyExits: number;
  totalRevenue: number;
  pendingFees: number;
}