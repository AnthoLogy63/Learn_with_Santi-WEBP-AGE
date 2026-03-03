import { apiClient } from "./apiClient";

export interface Rank {
    id: number;
    name: string;
    description: string;
    badge_image: string | null;
}

export interface User {
    id: number;
    username: string;
    dni: string;
    total_score: number;
    current_rank: Rank | null;
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
};
