import { apiClient, getAuthHeader, API_URL } from "./apiClient";

export interface Rank {
    id: number;
    name: string;
    description: string;
    badge_image: string | null;
}

export interface User {
    usu_cod: string;
    username: string;
    usu_dni: string;
    usu_nom: string;
    usu_sex: 'M' | 'F' | null;
    usu_edad: number;
    usu_pun_tot: number;
    cat_cod: string | null;
    ran_sig: number | null;
    usu_fec_ult: string | null;
    usu_reg: string;
    is_staff: boolean;
    usu_fot?: string | null;
    ran_nom?: string;
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

const MOCK_ADMIN: User = {
    usu_cod: "ADM001",
    username: "admin",
    usu_dni: "admin123",
    usu_nom: "Administrador de Prueba",
    usu_sex: "M",
    usu_edad: 30,
    usu_pun_tot: 1000,
    cat_cod: "ADMIN",
    ran_sig: 2,
    usu_fec_ult: new Date().toISOString(),
    usu_reg: new Date().toISOString(),
    is_staff: true,
};

const MOCK_USER: User = {
    usu_cod: "USR001",
    username: "user",
    usu_dni: "user123",
    usu_nom: "Usuario de Prueba",
    usu_sex: "F",
    usu_edad: 25,
    usu_pun_tot: 150,
    cat_cod: "ASUR",
    ran_sig: 1,
    usu_fec_ult: new Date().toISOString(),
    usu_reg: new Date().toISOString(),
    is_staff: false,
};

/**
 * Servicio para gestionar las operaciones relacionadas con los usuarios.
 */
export const userService = {
    /**
     * Realiza el login del usuario enviando username y dni.
     * Soporta credenciales harcodeadas para pruebas sin backend.
     */
    login: async (username: string, dni: string) => {
        // Bypass con credenciales harcodeadas
        if (username === "admin" && dni === "admin123") {
            return {
                ok: true,
                json: async () => MOCK_ADMIN,
            } as Response;
        }
        if (username === "user" && dni === "user123") {
            return {
                ok: true,
                json: async () => MOCK_USER,
            } as Response;
        }

        try {
            const response = await fetch(`${API_URL}/users/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, dni }),
            });
            return response;
        } catch (error) {
            console.error("Login fetch error:", error);
            return { ok: false, status: 500 } as Response;
        }
    },

    /**
     * Obtiene los datos detallados y puntaje de un usuario específico.
     */
    getUserScore: async (usu_cod: string) => {
        try {
            const res = await apiClient(`/users/score/${usu_cod}/`);
            if (res.ok) return res;
            throw new Error("Backend offline");
        } catch (error) {
            const mockUser = usu_cod === "ADM001" ? MOCK_ADMIN : MOCK_USER;
            return {
                ok: true,
                json: async () => mockUser,
            } as Response;
        }
    },

    /**
     * Lista todos los usuarios (requiere permisos de Admin/Staff).
     */
    listUsers: async () => {
        try {
            const res = await apiClient(`/users/list/`);
            if (res.ok) return res;
            throw new Error("Backend offline");
        } catch (error) {
            return {
                ok: true,
                json: async () => [MOCK_ADMIN, MOCK_USER],
            } as Response;
        }
    },

    /**
     * Sube un archivo Excel para importar o actualizar usuarios de forma masiva.
     */
    importUsers: async (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return fetch(`${API_URL}/users/import/`, {
            method: 'POST',
            headers: { ...getAuthHeader() },
            body: form,
        });
    },

    /**
     * Limpia o resetea puntos de usuarios inactivos basándose en meses de inactividad.
     */
    cleanupInactive: async (months: number, deleteUsers: boolean) => {
        return apiClient(`/users/cleanup/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ months, delete: deleteUsers }),
        });
    },

    /**
     * Obtiene el ranking global de usuarios y la posición del usuario actual.
     */
    getRanking: async () => {
        try {
            const res = await apiClient(`/users/ranking/`);
            if (res.ok) return res;
            throw new Error("Backend offline");
        } catch (error) {
            return {
                ok: true,
                json: async () => ({
                    ranking: [
                        { ...MOCK_ADMIN, rank: 1, usu_pun_tot: 1000 },
                        { ...MOCK_USER, rank: 2, usu_pun_tot: 150 },
                    ],
                    user_position: 2
                }),
            } as Response;
        }
    },

    /**
     * Descarga la plantilla de Excel oficial para la importación de usuarios.
     */
    downloadTemplate: async () => {
        const res = await fetch(`${API_URL}/users/template/`, {
            headers: { ...getAuthHeader() },
        });
        if (!res.ok) throw new Error("Error al descargar la plantilla");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_usuarios.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    },
};
