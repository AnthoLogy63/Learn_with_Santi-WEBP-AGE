import { useState, useEffect } from "react";
import { examService, Exam } from "@/api/examService";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const ExamManagement = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

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
        try {
            const response = await examService.toggleEnabled(examId);
            if (response.ok) {
                const data = await response.json();
                setExams(prev => prev.map(e => e.id === examId ? { ...e, is_enabled: data.is_enabled } : e));
                toast.success(`Examen ${data.is_enabled ? 'habilitado' : 'deshabilitado'} correctamente`);
            }
        } catch (error) {
            toast.error("No se pudo cambiar el estado del examen");
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
        <div className="space-y-8">
            <header className="mb-10">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3 drop-shadow-lg">
                    Gestión de Exámenes
                </h1>
                <p className="text-lg lg:text-xl text-white/80 max-w-2xl leading-relaxed">
                    Habilita o deshabilita las evaluaciones para los usuarios.
                </p>
            </header>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {exams.map((exam) => (
                    <div key={exam.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:scale-[1.02] transition-all">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${exam.is_enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                    {exam.is_enabled ? 'Habilitado' : 'Deshabilitado'}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{exam.name}</h3>
                            <p className="text-white/60 text-sm line-clamp-2 mb-6">{exam.description || 'Sin descripción disponible.'}</p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Estado de visibilidad</span>

                            {/* Toggle Switch */}
                            <button
                                onClick={() => handleToggle(exam.id)}
                                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#001c4d] ${exam.is_enabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${exam.is_enabled ? 'translate-x-8' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {exams.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-white/40 font-medium">No hay exámenes registrados en el sistema.</p>
                </div>
            )}
        </div>
    );
};

export default ExamManagement;
