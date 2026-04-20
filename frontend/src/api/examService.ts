import { apiClient, getAuthHeader, API_URL } from "./apiClient";

export interface Exam {
    exa_cod: string;
    exa_nom: string;
    exa_des: string;
    exa_fot?: string | null;
    status?: string;
}

export interface Categoria {
    cat_cod: string;
    cat_nom: string;
}

export interface Competencia {
    com_cod: string;
    com_nom: string;
    com_des: string | null;
}

export interface TipoPregunta {
    tip_pre_cod: number;
    tip_pre_nom: string;
}

export interface ExamOption {
    opc_cod: string;
    opc_tex: string;
    opc_cor: boolean;
}

export interface LocalOption extends ExamOption {
    isNew?: boolean;
    isDirty?: boolean;
    isDeleted?: boolean;
}

export interface Question {
    pre_cod: string;
    pre_tex: string;
    pre_fot: string | null;
    pre_pun: number;
    pre_tie: number;
    tip_pre_cod?: number;
    com_cod?: string;
    options: LocalOption[];
}

export interface LocalQuestion extends Question {
    isNew?: boolean;
    isDirty?: boolean;
    isDeleted?: boolean;
    tempImageFile?: File;
    tempImageUrl?: string;
}

export interface ExamImportResult {
    modo: "creado" | "reemplazado";
    exam_id: number;
    exam_name: string;
    preguntas_creadas: number;
    opciones_creadas: number;
    errores: string[];
}

const MOCK_EXAMS: Exam[] = [
    { exa_cod: "EXA001", exa_nom: "Examen de Inducción", exa_des: "Conocimientos básicos del sistema", status: "En Progreso" },
    { exa_cod: "EXA002", exa_nom: "Cultura Organizacional", exa_des: "Misión, visión y valores", status: "No Iniciado" },
    { exa_cod: "EXA003", exa_nom: "Seguridad de la Información", exa_des: "Protocolos y mejores prácticas", status: "Completado" },
];

/**
 * Servicio para gestionar todas las operaciones de exámenes y resultados.
 */
export const examService = {
    /**
     * Obtiene la lista de todos los exámenes disponibles.
     */
    getExams: async (): Promise<Exam[]> => {
        try {
            const res = await apiClient("/exams/");
            return await res.json();
        } catch (error) {
            console.warn("Using mock exams due to network error");
            return MOCK_EXAMS;
        }
    },

    /**
     * Obtiene la lista de categorías predefinidas en el sistema.
     */
    getCategorias: async (): Promise<Categoria[]> => {
        try {
            const res = await apiClient("/exams/categorias/");
            return await res.json();
        } catch (error) {
            return [
                { cat_cod: "ASUR", cat_nom: "Asesor" },
                { cat_cod: "ADMIN", cat_nom: "Administrador" }
            ];
        }
    },

    /**
     * Obtiene la lista de competencias configurables.
     */
    getCompetencias: async (): Promise<Competencia[]> => {
        try {
            const res = await apiClient("/exams/competencias/");
            return await res.json();
        } catch (error) {
            return [
                { com_cod: "COM001", com_nom: "Competencia 1", com_des: "Descripción mock" },
                { com_cod: "COM002", com_nom: "Competencia 2", com_des: "Descripción mock" }
            ];
        }
    },

    /**
     * Lista los tipos de pregunta (Opción Múltiple, Abierta, etc.).
     */
    getTipoPreguntas: async (): Promise<TipoPregunta[]> => {
        try {
            const res = await apiClient("/exams/tipos-pregunta/");
            return await res.json();
        } catch (error) {
            return [
                { tip_pre_cod: 1, tip_pre_nom: "Opción Múltiple" },
                { tip_pre_cod: 2, tip_pre_nom: "Abierta" }
            ];
        }
    },

    /**
     * Crea un nuevo examen con datos básicos.
     */
    createExam: async (data: Partial<Exam>) => {
        return apiClient("/exams/", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });
    },

    /**
     * Asocia una categoría a un examen específico.
     */
    assignCategoryToExam: async (exa_cod: string, cat_cod: string) => {
        return apiClient("/exams/categoria_examen/", {
            method: 'POST',
            body: JSON.stringify({ exa_cod, cat_cod }),
            headers: { 'Content-Type': 'application/json' },
        });
    },

    /**
     * Configura cuántas preguntas de cierta competencia se mostrarán para una categoría en un examen.
     */
    assignCompetenceToExam: async (data: { exa_cod: string, cat_cod: string, com_cod: string, num_preguntas: number }) => {
        return apiClient("/exams/examen_categoria_competencia/", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });
    },

    /**
     * Inicia un nuevo intento de examen para el asesor o reanuda uno 'En Progreso'.
     */
    startOrResume: async (exa_cod: string) => {
        try {
            return await apiClient(`/exams/${exa_cod}/start_or_resume/`, {
                method: 'GET'
            });
        } catch (error) {
            return {
                ok: true,
                json: async () => ({
                    int_cod: "INT001",
                    preguntas: [
                        { pre_cod: "PRE001", pre_tex: "Pregunta de prueba 1?", options: [{ opc_cod: "OPC1", opc_tex: "Opción 1" }] }
                    ]
                })
            } as Response;
        }
    },

    /**
     * Guarda las respuestas de forma parcial sin finalizar el examen.
     */
    saveProgress: async (exa_cod: string, int_cod: string, respuestas: any[]) => {
        return apiClient(`/exams/${exa_cod}/save_progress/`, {
            method: 'POST',
            body: JSON.stringify({ int_cod, respuestas }),
            headers: { 'Content-Type': 'application/json' },
        });
    },

    /**
     * Finaliza el examen y activa el cálculo de puntaje en el backend.
     */
    finishAttempt: async (exa_cod: string, int_cod: string) => {
        return apiClient(`/exams/${exa_cod}/finish_attempt/`, {
            method: 'POST',
            body: JSON.stringify({ int_cod }),
            headers: { 'Content-Type': 'application/json' },
        });
    },

    /**
     * Actualiza metadatos del examen (nombre, descripción, imagen).
     */
    updateExam: async (exa_cod: string, data: Partial<Exam>) => {
        return apiClient(`/exams/${exa_cod}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });
    },

    /**
     * Elimina un examen y sus dependencias (preguntas, opciones).
     */
    deleteExam: async (exa_cod: string) => {
        return apiClient(`/exams/${exa_cod}/`, {
            method: 'DELETE',
        });
    },

    /**
     * Obtiene el banco completo de preguntas de un examen específico.
     */
    getAllQuestions: async (exa_cod: string): Promise<Question[]> => {
        try {
            const res = await apiClient(`/exams/questions/?exa_cod=${exa_cod}`);
            return await res.json();
        } catch (error) {
            return [
                { pre_cod: "PRE001", pre_tex: "Pregunta de ejemplo mock", pre_fot: null, pre_pun: 10, pre_tie: 60, options: [] }
            ];
        }
    },

    /**
     * Crea una nueva pregunta. Usa multipart/form-data para permitir subida de imágenes.
     */
    createQuestion: async (exa_cod: string, formData: FormData) => {
        return fetch(`${API_URL}/exams/questions/?exa_cod=${exa_cod}`, {
            method: 'POST',
            headers: { ...getAuthHeader() },
            body: formData,
        });
    },

    /**
     * Actualiza una pregunta existente (texto, puntaje, tiempo, imagen).
     */
    updateQuestion: async (pre_cod: string, formData: FormData) => {
        return fetch(`${API_URL}/exams/questions/${pre_cod}/`, {
            method: 'PATCH',
            headers: { ...getAuthHeader() },
            body: formData,
        });
    },

    /**
     * Elimina una pregunta permanentemente.
     */
    deleteQuestion: async (pre_cod: string) => {
        return apiClient(`/exams/questions/${pre_cod}/`, {
            method: 'DELETE',
        });
    },

    /**
     * Crea una opción de respuesta para una pregunta.
     */
    createOption: async (pre_cod: string, data: Partial<ExamOption>) => {
        return apiClient(`/exams/options/`, {
            method: 'POST',
            body: JSON.stringify({ ...data, pre_cod }),
            headers: { 'Content-Type': 'application/json' },
        });
    },

    /**
     * Actualiza el texto o si es correcta una opción de respuesta.
     */
    updateOption: async (opc_cod: string, data: Partial<ExamOption>) => {
        return apiClient(`/exams/options/${opc_cod}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });
    },

    /**
     * Elimina una opción de respuesta.
     */
    deleteOption: async (opc_cod: string) => {
        return apiClient(`/exams/options/${opc_cod}/`, {
            method: 'DELETE',
        });
    },

    /**
     * Lista intentos pasados y resultados detallados de los usuarios.
     */
    getUserResults: async (search: string = "", offset: number = 0) => {
        try {
            const res = await apiClient(`/exams/attempts/user_results/?search=${search}&offset=${offset}`);
            return res;
        } catch (error) {
            return {
                ok: true,
                json: async () => [
                    { usu_nom: "Usuario Prueba", exa_nom: "Examen mock", score: 85, date: "2024-04-20" }
                ]
            } as Response;
        }
    },

    /**
     * Procesa un archivo Excel para cargar banco de preguntas masivamente.
     */
    importExam: async (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return fetch(`${API_URL}/exams/import/`, {
            method: 'POST',
            headers: { ...getAuthHeader() },
            body: form,
        });
    },

    /**
     * Obtiene la configuración completa de un examen (categorías y competencias asignadas).
     */
    getExamConfig: async (exa_cod: string) => {
        try {
            const res = await apiClient(`/exams/${exa_cod}/get_config/`);
            return await res.json();
        } catch (error) {
            return { categories: [], competencies: [] };
        }
    },

    /**
     * Guarda de forma masiva cambios en las categorías y competencias de un examen.
     */
    bulkUpdateExam: async (exa_cod: string, data: any) => {
        return apiClient(`/exams/${exa_cod}/bulk_save/`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        });
    },

    /**
     * Obtiene un resumen estadístico (promedios, máximos) de los resultados.
     */
    getStatsSummary: async () => {
        try {
            const res = await apiClient(`/exams/stats_summary/`);
            if (res.ok) return res;
            throw new Error("Backend offline");
        } catch (error) {
            return {
                ok: true,
                json: async () => ({
                    avg_score: 75,
                    total_attempts: 10,
                    top_performer: "Usuario de Prueba"
                })
            } as Response;
        }
    },

    /**
     * Genera y exporta los resultados detallados a un archivo Excel.
     */
    exportResults: async (exa_cod: string | number) => {
        const res = await fetch(`${API_URL}/exams/${exa_cod}/export_results/`, {
            headers: { ...getAuthHeader() },
        });
        return res;
    },

    /**
     * Descarga la plantilla de Excel oficial para la importación del banco de preguntas.
     */
    downloadTemplate: async () => {
        const res = await fetch(`${API_URL}/exams/template/`, {
            headers: { ...getAuthHeader() },
        });
        if (!res.ok) throw new Error("Error al descargar la plantilla");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_examen.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    },
};


