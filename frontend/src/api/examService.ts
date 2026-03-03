import { apiClient } from "./apiClient";

export interface Exam {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    status: "pending" | "completed";
}

export const examService = {
    getExams: async () => {
        return apiClient("/exams/");
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
};
