import { apiClient } from "./apiClient";

export interface Exam {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    is_enabled: boolean;
    status: "pending" | "completed";
    last_score?: number;
}

export const examService = {
    getExams: async () => {
        return apiClient("/exams/");
    },

    toggleEnabled: async (examId: number) => {
        return apiClient(`/exams/${examId}/toggle_enabled/`, {
            method: 'POST',
        });
    },

    getStatsSummary: async () => {
        return apiClient("/exams/stats_summary/");
    },

    getQuestions: async (examId: string) => {
        return apiClient(`/exams/${examId}/questions/`);
    },

    submitAnswers: async (attemptId: number, answers: any[]) => {
        return apiClient(`/exams/attempts/${attemptId}/submit_answers/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers }),
        });
    },

    getUserResults: async () => {
        return apiClient("/exams/attempts/user_results/");
    },
};
