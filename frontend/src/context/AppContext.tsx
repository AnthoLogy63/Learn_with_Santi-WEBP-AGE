import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { userService, User } from "@/api/userService";
import { examService, Exam } from "@/api/examService";
export type { Exam };

export interface ExamResult {
  score: number;
  status: string;
  counts_for_score: boolean;
  total_user_score: number;
}

interface AppState {
  user: User | null;
  exams: Exam[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, dni: string) => Promise<boolean>;
  logout: () => void;
  fetchExams: () => Promise<void>;
  fetchUserScore: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [exams, setExams] = useState<Exam[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchExams();
    }
  }, [isAuthenticated]);

  const fetchExams = async () => {
    try {
      const response = await examService.getExams();
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const fetchUserScore = async () => {
    if (!user) return;
    try {
      const response = await userService.getUserScore(user.id);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error fetching user score:", error);
    }
  };

  const login = async (username: string, dni: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await userService.login(username, dni);

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(data));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    setExams([]);
  };

  return (
    <AppContext.Provider value={{ user, exams, isAuthenticated, isLoading, login, logout, fetchExams, fetchUserScore }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
