import { apiClient, getAuthHeader } from "./apiClient";

export interface Rank {
    id: number;
    name: string;
    description: string;
    badge_image: string | null;
}

export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    dni: string;
    total_score: number;
    current_rank: Rank | null;
    is_staff: boolean;
    is_active: boolean;
    last_login: string | null;
    date_joined: string;
}

export interface ImportResult {
    creados: number;
    actualizados: number;
    total_procesados: number;
    errores: { fila: number; motivo: string }[];
}

export interface CleanupResult {
    accion: string;
    cantidad: number;
    mensaje: string;
}

export const userService = {
    login: async (username: string, dni: string) => {
        const response = await fetch("http://localhost:8000/api/users/login/", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, dni }),
        });
        return response;
    },

    getUserScore: async (userId: number) => {
        return apiClient(`/users/score/${userId}/`);
    },

    listUsers: async () => {
        return apiClient(`/users/list/`);
    },

    importUsers: async (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/users/import/`, {
            method: 'POST',
            headers: { ...getAuthHeader() },
            body: form,
        });
    },

    cleanupInactive: async (months: number, deleteUsers: boolean) => {
        return apiClient(`/users/cleanup/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ months, delete: deleteUsers }),
        });
    },
};
