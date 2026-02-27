import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ExamResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  completedAt: string;
}

export interface Exam {
  id: string;
  title: string;
  icon: string;
  status: "pending" | "completed";
  result?: ExamResult;
}

export interface User {
  username: string;
  fullName: string;
  avatarUrl?: string;
  totalPoints: number;
}

interface AppState {
  user: User | null;
  exams: Exam[];
  isAuthenticated: boolean;
  login: (username: string, dni: string) => boolean;
  logout: () => void;
  completeExam: (examId: string, result: ExamResult) => void;
}

const defaultExams: Exam[] = [
  {
    id: "mi-bonito",
    title: "Conocimiento General - Mi Bonito",
    icon: "📘",
    status: "pending",
  },
  {
    id: "matematicas",
    title: "Matemáticas Aplicadas",
    icon: "📐",
    status: "pending",
  },
  {
    id: "economia",
    title: "Economía y Análisis Financiero",
    icon: "📊",
    status: "pending",
  },
];

const MOCK_USER = {
  username: "jperez",
  dni: "12345678",
  fullName: "Juan Pérez García",
};

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [exams, setExams] = useState<Exam[]>(defaultExams);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (username: string, dni: string): boolean => {
    if (username === MOCK_USER.username && dni === MOCK_USER.dni) {
      setUser({
        username: MOCK_USER.username,
        fullName: MOCK_USER.fullName,
        totalPoints: 0,
      });
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setExams(defaultExams);
  };

  const completeExam = (examId: string, result: ExamResult) => {
    setExams((prev) =>
      prev.map((exam) =>
        exam.id === examId ? { ...exam, status: "completed" as const, result } : exam
      )
    );
    setUser((prev) =>
      prev ? { ...prev, totalPoints: prev.totalPoints + result.score } : prev
    );
  };

  return (
    <AppContext.Provider value={{ user, exams, isAuthenticated, login, logout, completeExam }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
