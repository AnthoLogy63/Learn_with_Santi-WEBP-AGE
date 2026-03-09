import { apiClient, getAuthHeader } from "./apiClient";

export interface Exam {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    is_enabled: boolean;
    status: "pending" | "completed";
    last_score?: number;
}

export interface ExamImportResult {
    modo: "creado" | "reemplazado";
    exam_id: number;
    exam_name: string;
    preguntas_creadas: number;
    opciones_creadas: number;
    errores: string[];
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

    getUserResults: async (search: string = "", offset: number = 0) => {
        return apiClient(`/exams/attempts/user_results/?search=${search}&offset=${offset}`);
    },

    exportResults: async (examId: number) => {
        return apiClient(`/exams/${examId}/export_csv/`);
    },

    importExam: async (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/exams/import/`, {
            method: 'POST',
            headers: { ...getAuthHeader() },
            body: form,
        });
    },
};


