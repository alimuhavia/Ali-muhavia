import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, AttendanceLog, DashboardStats, StudentStatus, FeeStatus } from '../types';
import { MOCK_STUDENTS, MOCK_ATTENDANCE } from '../constants';

interface AcademyContextType {
  students: Student[];
  attendanceLogs: AttendanceLog[];
  stats: DashboardStats;
  addStudent: (student: Student) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  recordAttendance: (log: AttendanceLog) => void;
  refreshStats: () => void;
  resetDatabase: () => void;
}

const AcademyContext = createContext<AcademyContextType | undefined>(undefined);

export const AcademyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage (Database)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('academy_db_students');
      return saved ? JSON.parse(saved) : MOCK_STUDENTS;
    } catch (error) {
      console.error("Database Load Error:", error);
      return MOCK_STUDENTS;
    }
  });

  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(() => {
    try {
      const saved = localStorage.getItem('academy_db_logs');
      return saved ? JSON.parse(saved) : MOCK_ATTENDANCE;
    } catch (error) {
      console.error("Database Load Error:", error);
      return MOCK_ATTENDANCE;
    }
  });

  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateArrivals: 0,
    earlyExits: 0,
    totalRevenue: 0,
    pendingFees: 0,
  });

  // Database Persistence: Save on every change
  useEffect(() => {
    localStorage.setItem('academy_db_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('academy_db_logs', JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);

  const refreshStats = () => {
    const activeStudents = students.filter(s => s.status === StudentStatus.Active);
    const today = new Date().toISOString().split('T')[0];
    
    // Simple logic: a student is present if they have an ENTRY log today
    const presentIds = new Set(
      attendanceLogs
        .filter(l => l.timestamp.startsWith(today) && l.type === 'ENTRY')
        .map(l => l.studentId)
    );

    const lateCount = attendanceLogs.filter(l => l.timestamp.startsWith(today) && l.isLate).length;
    const earlyCount = attendanceLogs.filter(l => l.timestamp.startsWith(today) && l.isEarlyExit).length;

    const pending = students.filter(s => s.feeStatus !== FeeStatus.Paid).reduce((acc, curr) => acc + curr.feeAmount, 0);
    const revenue = students.filter(s => s.feeStatus === FeeStatus.Paid).reduce((acc, curr) => acc + curr.feeAmount, 0);

    setStats({
      totalStudents: activeStudents.length,
      presentToday: presentIds.size,
      absentToday: activeStudents.length - presentIds.size,
      lateArrivals: lateCount,
      earlyExits: earlyCount,
      totalRevenue: revenue,
      pendingFees: pending
    });
  };

  useEffect(() => {
    refreshStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, attendanceLogs]);

  const addStudent = (student: Student) => {
    setStudents(prev => [...prev, student]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const recordAttendance = (log: AttendanceLog) => {
    setAttendanceLogs(prev => [log, ...prev]);
  };

  const resetDatabase = () => {
    setStudents([]);
    setAttendanceLogs([]);
    localStorage.removeItem('academy_db_students');
    localStorage.removeItem('academy_db_logs');
  };

  return (
    <AcademyContext.Provider value={{
      students,
      attendanceLogs,
      stats,
      addStudent,
      updateStudent,
      recordAttendance,
      refreshStats,
      resetDatabase
    }}>
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (!context) {
    throw new Error('useAcademy must be used within an AcademyProvider');
  }
  return context;
};