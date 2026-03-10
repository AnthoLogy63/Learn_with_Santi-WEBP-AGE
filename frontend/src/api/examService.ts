import { apiClient, getAuthHeader } from "./apiClient";

export interface Exam {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    is_enabled: boolean;
    is_timed: boolean;
    status: "pending" | "completed";
    last_score?: number;
    bank_total_questions?: number;
    questions_per_attempt?: number;
    max_scored_attempts?: number;
    max_points?: number;
}

export interface Question {
    id: number;
    text: string;
    image: string | null;
    question_type: "single_choice" | "multiple_choice" | "open_ended";
    points: number;
    time_limit_seconds: number;
    options: Option[];
}

export interface Option {
    id: number;
    text: string;
    is_correct: boolean;
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

    createExam: async (data: Partial<Exam>) => {
        return apiClient("/exams/", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });
    },

    updateExam: async (id: number, data: Partial<Exam>) => {
        return apiClient(`/exams/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });
    },

    deleteExam: async (id: number) => {
        return apiClient(`/exams/${id}/`, {
            method: 'DELETE',
        });
    },

    toggleEnabled: async (examId: number) => {
        return apiClient(`/exams/${examId}/toggle_enabled/`, { method: 'POST' });
    },

    getStatsSummary: async () => {
        return apiClient("/exams/stats_summary/");
    },

    getQuestions: async (examId: string) => {
        return apiClient(`/exams/${examId}/questions/`);
    },

    getAllQuestions: async (examId: string | number) => {
        return apiClient(`/exams/${examId}/all_questions/`);
    },

    // CRUD Questions
    createQuestion: async (examId: number, formData: FormData) => {
        // We use FormData for image upload
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/exams/questions/?exam_id=${examId}`, {
            method: 'POST',
            headers: { ...getAuthHeader() },
            body: formData,
        });
    },

    updateQuestion: async (questionId: number, formData: FormData) => {
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/exams/questions/${questionId}/`, {
            method: 'PATCH',
            headers: { ...getAuthHeader() },
            body: formData,
        });
    },

    deleteQuestion: async (questionId: number) => {
        return apiClient(`/exams/questions/${questionId}/`, {
            method: 'DELETE',
        });
    },

    // CRUD Options
    createOption: async (questionId: number, data: Partial<Option>) => {
        return apiClient(`/exams/options/?question_id=${questionId}`, {
            method: 'POST',
            body: JSON.stringify({ ...data, question: questionId }),
            headers: { 'Content-Type': 'application/json' },
        });
    },

    updateOption: async (optionId: number, data: Partial<Option>) => {
        return apiClient(`/exams/options/${optionId}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });
    },

    deleteOption: async (optionId: number) => {
        return apiClient(`/exams/options/${optionId}/`, {
            method: 'DELETE',
        });
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

    syncExam: async (examId: number, formData: FormData) => {
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/exams/${examId}/sync/`, {
            method: 'POST',
            headers: { ...getAuthHeader() },
            body: formData,
        });
    },
};


