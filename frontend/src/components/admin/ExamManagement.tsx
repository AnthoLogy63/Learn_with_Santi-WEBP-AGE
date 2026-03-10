import { useState, useEffect } from "react";
import { examService, Exam } from "@/api/examService";
import { Loader2, Edit3, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ExamEditor from "@/components/admin/ExamEditor";

const ExamManagement = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingExamId, setEditingExamId] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
    const [isCreatingExam, setIsCreatingExam] = useState(false);

    const fetchAllExams = async () => {
        try {
            const response = await examService.getExams();
            if (response.ok) {
                const data = await response.json();
                setExams(data);
            }
        } catch (error) {
            console.error("Error fetching exams:", error);
            toast.error("Error al cargar los exámenes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllExams();
    }, []);

    const handleToggle = async (examId: number) => {
        setActionLoading(prev => ({ ...prev, [examId]: true }));
        try {
            const response = await examService.toggleEnabled(examId);
            if (response.ok) {
                const data = await response.json();
                setExams(prev => prev.map(e => e.id === examId ? { ...e, is_enabled: data.is_enabled } : e));
                toast.success(`Examen ${data.is_enabled ? 'habilitado' : 'deshabilitado'} correctamente`);
            }
        } catch (error) {
            toast.error("No se pudo cambiar el estado del examen");
        } finally {
            setActionLoading(prev => ({ ...prev, [examId]: false }));
        }
    };

    const handleCreateExam = async () => {
        setIsCreatingExam(true);
        try {
            const response = await examService.createExam({
                name: "Nueva Evaluación",
                description: "Descripción de la evaluación.",
                is_timed: true
            });
            if (response.ok) {
                const newExam = await response.json();
                setExams(prev => [newExam, ...prev]);
                setEditingExamId(newExam.id);
                toast.success("Evaluación creada. Ahora puedes editarla.");
            }
        } catch (error) {
            toast.error("Error al crear evaluación");
        } finally {
            setIsCreatingExam(false);
        }
    };


    const handleDeleteExam = async (examId: number) => {
        if (!confirm("¿Estás seguro de que deseas eliminar permanentemente esta evaluación y todas sus preguntas? Esta acción no se puede deshacer.")) return;

        setActionLoading(prev => ({ ...prev, [examId]: true }));
        try {
            const response = await examService.deleteExam(examId);
            if (response.ok) {
                setExams(prev => prev.filter(e => e.id !== examId));
                toast.success("Evaluación eliminada correctamente");
            } else {
                toast.error("Error al eliminar la evaluación");
                setActionLoading(prev => ({ ...prev, [examId]: false }));
            }
        } catch (error) {
            toast.error("Error de conexión");
            setActionLoading(prev => ({ ...prev, [examId]: false }));
        }
    };


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-white mb-4" />
                <p className="text-white/60 font-medium">Cargando gestión de exámenes...</p>
            </div>
        );
    }

    return (
        <>
            {/* Editor modal */}
            {editingExamId && (
                <ExamEditor
                    examId={editingExamId}
                    onClose={() => setEditingExamId(null)}
                    onSaveSuccess={fetchAllExams}
                />
            )}

            <div className="space-y-8 p-2 md:p-0">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3 drop-shadow-lg">
                            Gestión de Exámenes
                        </h1>
                        <p className="text-base md:text-lg lg:text-xl text-white/80 max-w-2xl leading-relaxed">
                            Crea, edita o importa evaluaciones. Controla la visibilidad y el tiempo para cada reto académico.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCreateExam}
                            disabled={isCreatingExam}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                        >
                            {isCreatingExam ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {isCreatingExam ? "Creando..." : "Nueva Evaluación"}
                        </button>
                    </div>
                </header>

                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {exams.map((exam) => (
                        <div key={exam.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:scale-[1.02] transition-all">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${exam.is_enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                        {exam.is_enabled ? 'Habilitado' : 'Deshabilitado'}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteExam(exam.id)}
                                        disabled={actionLoading[exam.id]}
                                        className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                                        title="Eliminar Evaluación"
                                    >
                                        {actionLoading[exam.id] ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{exam.name}</h3>
                                <p className="text-white/60 text-sm line-clamp-2 mb-6">{exam.description || 'Sin descripción disponible.'}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col gap-3">
                                    {/* Botón editar */}
                                    <button
                                        onClick={() => setEditingExamId(exam.id)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-300 text-[10px] font-black uppercase tracking-widest hover:bg-orange-500/30 hover:text-orange-200 transition-all"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                        Editar Evaluación
                                    </button>
                                </div>

                                {/* Toggle habilitado */}
                                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                    <span className="text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-widest">Estado de visibilidad</span>
                                    <button
                                        onClick={() => handleToggle(exam.id)}
                                        disabled={actionLoading[exam.id]}
                                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#001c4d] disabled:opacity-50 ${exam.is_enabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                                    >
                                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all flex items-center justify-center ${exam.is_enabled ? 'translate-x-8' : 'translate-x-1'}`}>
                                            {actionLoading[exam.id] && <Loader2 size={10} className="animate-spin text-slate-400" />}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {exams.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                        <p className="text-white/40 font-medium text-sm">No hay exámenes registrados en el sistema.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default ExamManagement;
