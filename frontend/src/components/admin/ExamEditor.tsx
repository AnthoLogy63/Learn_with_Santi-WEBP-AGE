import { useState, useEffect } from "react";
import { examService, Exam, Question, Option } from "@/api/examService";
import {
    X, Save, Plus, Trash2, Image as ImageIcon,
    Clock, CheckCircle, HelpCircle, ChevronDown,
    ChevronUp, AlertCircle, Loader2, Eye
} from "lucide-react";
import { toast } from "sonner";
import AdminExamPreview from "./AdminExamPreview";

interface ExamEditorProps {
    examId: number;
    onClose: () => void;
    onSaveSuccess?: () => void;
}

interface LocalOption extends Option {
    isNew?: boolean;
    isDirty?: boolean;
    isDeleted?: boolean;
}

interface LocalQuestion extends Question {
    options: LocalOption[];
    isNew?: boolean;
    isDirty?: boolean;
    isDeleted?: boolean;
    tempImageFile?: File;
    tempImageUrl?: string;
}

const ExamEditor = ({ examId, onClose, onSaveSuccess }: ExamEditorProps) => {
    const [exam, setExam] = useState<Exam | null>(null);
    const [questions, setQuestions] = useState<LocalQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchExamData();
    }, [examId]);

    // Check for changes
    useEffect(() => {
        const changed = questions.some(q => q.isDirty || q.isNew || q.isDeleted || q.options.some(o => o.isDirty || o.isNew || o.isDeleted));
        setHasChanges(changed);

        // Prevent window close if changes exist
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (changed) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [questions]);

    const fetchExamData = async () => {
        setLoading(true);
        try {
            const [examRes, questionsRes] = await Promise.all([
                examService.getExams(),
                examService.getAllQuestions(examId)
            ]);

            if (examRes.ok) {
                const exams = await examRes.json();
                const currentExam = exams.find((e: Exam) => e.id === examId);
                setExam(currentExam || null);
            }

            if (questionsRes.ok) {
                const qData = await questionsRes.json();
                setQuestions(qData.questions.map((q: any) => ({
                    ...q,
                    options: q.options.map((o: any) => ({ ...o }))
                })));
            }
        } catch (error) {
            console.error("Error fetching exam data:", error);
            toast.error("Error al cargar los datos del examen");
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (q: LocalQuestion) => {
        if (q.tempImageUrl) return q.tempImageUrl;
        if (!q.image) return null;
        if (q.image.startsWith('http')) return q.image;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
        return `${baseUrl}${q.image}`;
    };

    const handleSaveEverything = async () => {
        if (!exam) return;
        setSaving(true);
        try {
            const formData = new FormData();

            // Prepare the full state for JSON serialization
            // We include everything: exam metadata and questions (with options)
            const syncData = {
                ...exam,
                questions: questions.map(q => ({
                    ...q,
                    // Keep the tempImageUrl for local reference if needed, 
                    // though the backend doesn't need it.
                    options: q.options
                }))
            };

            formData.append('data', JSON.stringify(syncData));

            // Append all new image files with a predictable key
            questions.forEach(q => {
                if (q.tempImageFile) {
                    formData.append(`image_q_${q.id}`, q.tempImageFile);
                }
            });

            const res = await examService.syncExam(exam.id, formData);

            if (res.ok) {
                toast.success("Examen sincronizado correctamente");
                setHasChanges(false);
                await fetchExamData(); // Reload to get fresh IDs and clean states
                onSaveSuccess?.();
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || "Error al sincronizar el examen");
            }
        } catch (error) {
            console.error("Sync error:", error);
            toast.error("Error crítico al guardar los cambios");
        } finally {
            setSaving(false);
        }
    };

    const handleAddQuestion = () => {
        const newQ: LocalQuestion = {
            id: Math.random(), // Temporary ID
            text: "Nueva Pregunta",
            question_type: "single_choice",
            points: 10,
            time_limit_seconds: 60,
            image: null,
            options: [],
            isNew: true
        };
        setQuestions([...questions, newQ]);
        setExpandedQuestion(newQ.id);
    };

    const handleDeleteQuestion = (qId: number) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, isDeleted: true } : q));
    };

    const handleUpdateQuestion = (qId: number, data: Partial<LocalQuestion>, file?: File) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const updated = { ...q, ...data, isDirty: true };
                if (file) {
                    updated.tempImageFile = file;
                    updated.tempImageUrl = URL.createObjectURL(file);
                }
                return updated;
            }
            return q;
        }));
    };

    const handleAddOption = (qId: number) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOpt: LocalOption = {
                    id: Math.random(),
                    text: 'Nueva opción',
                    is_correct: false,
                    isNew: true
                };
                return { ...q, options: [...q.options, newOpt] };
            }
            return q;
        }));
    };

    const handleUpdateOption = (qId: number, optId: number, data: Partial<LocalOption>) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return {
                    ...q,
                    options: q.options.map(o => o.id === optId ? { ...o, ...data, isDirty: true } : o)
                };
            }
            return q;
        }));
    };

    const handleDeleteOption = (qId: number, optId: number) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return {
                    ...q,
                    options: q.options.map(o => o.id === optId ? { ...o, isDeleted: true } : o)
                };
            }
            return q;
        }));
    };

    const handleClose = () => {
        if (hasChanges) {
            if (confirm("Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?")) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#001c4d]/80 backdrop-blur-xl z-[60] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#001c4d] z-[60] overflow-y-auto animate-fade-in flex flex-col">
            {/* Header Sticky */}
            <div className="sticky top-0 bg-[#001c4d]/90 backdrop-blur-md border-b border-white/10 p-4 md:p-6 z-10 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4">
                    <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                        <X size={24} />
                    </button>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Editor de Evaluación</h2>
                        <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">ID: {examId} {hasChanges && <span className="text-amber-400 ml-2">(Cambios sin guardar)</span>}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowPreview(true)}
                        className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500/30 transition-all shadow-lg"
                    >
                        <Eye size={18} />
                        Vista Previa
                    </button>
                    <button
                        onClick={handleSaveEverything}
                        disabled={saving || !hasChanges}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} />}
                        Guardar Cambios
                    </button>
                </div>
            </div>

            {/* Modal de Vista Previa */}
            {showPreview && exam && (
                <AdminExamPreview
                    examId={examId}
                    examName={exam.name}
                    onClose={() => setShowPreview(false)}
                />
            )}

            <div className="max-w-5xl mx-auto w-full p-4 md:p-8 space-y-8 flex-1">
                {/* Exam Settings Card */}
                <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Nombre del Examen</label>
                            <input
                                type="text"
                                value={exam?.name || ""}
                                onChange={(e) => setExam(exam ? { ...exam, name: e.target.value } : null)}
                                className="w-full bg-white/5 border border-white/20 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 font-bold"
                            />
                        </div>
                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-3 cursor-pointer group bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition-all w-full md:w-fit">
                                <div className={`h-6 w-11 rounded-full p-1 transition-colors ${exam?.is_timed ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                                    <div className={`h-4 w-4 bg-white rounded-full transition-transform ${exam?.is_timed ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-white font-bold text-sm">Examen Contrareloj</span>
                                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Activar cronómetro</span>
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={exam?.is_timed}
                                    onChange={(e) => setExam(exam ? { ...exam, is_timed: e.target.checked } : null)}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Descripción</label>
                        <textarea
                            rows={3}
                            value={exam?.description || ""}
                            onChange={(e) => setExam(exam ? { ...exam, description: e.target.value } : null)}
                            className="w-full bg-white/5 border border-white/20 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.15em] ml-1">Preguntas/Intento</label>
                            <input
                                type="number"
                                value={exam?.questions_per_attempt || 0}
                                onChange={(e) => setExam(exam ? { ...exam, questions_per_attempt: parseInt(e.target.value) } : null)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.15em] ml-1">Intentos Permitidos</label>
                            <input
                                type="number"
                                value={exam?.max_scored_attempts || 0}
                                onChange={(e) => setExam(exam ? { ...exam, max_scored_attempts: parseInt(e.target.value) } : null)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.15em] ml-1">Puntaje Máximo</label>
                            <input
                                type="number"
                                value={exam?.max_points || 0}
                                onChange={(e) => setExam(exam ? { ...exam, max_points: parseInt(e.target.value) } : null)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3 justify-center bg-white/5 rounded-xl border border-white/10 mt-5">
                            <HelpCircle size={16} className="text-white/40" />
                            <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">{questions.length} PREGUNTAS TOTAL</span>
                        </div>
                    </div>
                </section>

                {/* Questions Section */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-[0.2em]">Cuestionario</h3>
                        <button
                            onClick={handleAddQuestion}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl border border-white/20 transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                            <Plus size={16} />
                            Añadir Pregunta
                        </button>
                    </div>

                    <div className="space-y-4 pb-20">
                        {questions.filter(q => !q.isDeleted).map((q, idx) => (
                            <div key={q.id} className="bg-white rounded-3xl overflow-hidden shadow-2xl transition-all border border-white/10">
                                {/* Question Header */}
                                <div
                                    className="p-4 md:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                    onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-[#001c4d] text-white h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs shadow-md">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#001c4d] truncate max-w-[200px] md:max-w-md">{q.text}</p>
                                            <div className="flex gap-3 items-center mt-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">{q.question_type}</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-[#001c4d]/60">{q.points} pts</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        {expandedQuestion === q.id ? <ChevronUp className="text-[#001c4d]/40" /> : <ChevronDown className="text-[#001c4d]/40" />}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {expandedQuestion === q.id && (
                                    <div className="p-4 md:p-8 border-t border-slate-100 bg-slate-50/50 space-y-8 animate-in slide-in-from-top-4">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                            {/* Left: Metadata */}
                                            <div className="md:col-span-8 space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enunciado de la pregunta</label>
                                                    <textarea
                                                        value={q.text}
                                                        onChange={(e) => handleUpdateQuestion(q.id, { text: e.target.value })}
                                                        rows={2}
                                                        className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 text-[#001c4d] focus:ring-2 focus:ring-[#001c4d]/20 focus:outline-none font-bold"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</label>
                                                        <select
                                                            value={q.question_type}
                                                            onChange={(e) => handleUpdateQuestion(q.id, { question_type: e.target.value as any })}
                                                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-[#001c4d] text-sm font-bold"
                                                        >
                                                            <option value="single_choice">Opción Única</option>
                                                            <option value="multiple_choice">Opción Múltiple</option>
                                                            <option value="open_ended">Respuesta Abierta (Opinión)</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Puntos</label>
                                                        <input
                                                            type="number"
                                                            value={q.points}
                                                            onChange={(e) => handleUpdateQuestion(q.id, { points: parseInt(e.target.value) || 0 })}
                                                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-[#001c4d] text-sm font-bold"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo (s)</label>
                                                        <div className="relative">
                                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                            <input
                                                                type="number"
                                                                disabled={!exam?.is_timed}
                                                                value={q.time_limit_seconds}
                                                                onChange={(e) => handleUpdateQuestion(q.id, { time_limit_seconds: parseInt(e.target.value) || 0 })}
                                                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-[#001c4d] text-sm font-bold disabled:opacity-40"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Image Upload */}
                                            <div className="md:col-span-4 space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guía Visual (Opcional)</label>
                                                <div className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center overflow-hidden group">
                                                    {getImageUrl(q) ? (
                                                        <>
                                                            <img src={getImageUrl(q)!} alt="Guia" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-[#001c4d]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <label className="bg-white text-[#001c4d] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer">Cambiar Foto</label>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ImageIcon className="h-8 w-8 text-slate-300 mb-2" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subir Imagen</span>
                                                        </>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleUpdateQuestion(q.id, {}, file);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Answers Section */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                                <h4 className="text-[11px] font-black text-[#001c4d] uppercase tracking-widest">Opciones de Respuesta</h4>
                                                {q.question_type !== 'open_ended' && (
                                                    <button
                                                        onClick={() => handleAddOption(q.id)}
                                                        className="flex items-center gap-1 text-[#001c4d] hover:bg-[#001c4d]/5 px-3 py-1 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest border border-slate-200"
                                                    >
                                                        <Plus size={14} />
                                                        Añadir Opción
                                                    </button>
                                                )}
                                            </div>

                                            {q.question_type === 'open_ended' ? (
                                                <div className="p-8 bg-blue-50 border border-blue-100 rounded-3xl flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <AlertCircle />
                                                    </div>
                                                    <p className="text-sm font-medium text-blue-900 leading-relaxed">
                                                        <strong>Modo Respuesta Abierta:</strong> El sistema mostrará un cuadro de texto al analista.
                                                        Cualquier respuesta escrita será calificada como válida para efectos de flujo, ideal para encuestas u opiniones.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {q.options.filter(o => !o.isDeleted).map((opt, oIdx) => (
                                                        <div key={opt.id} className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all ${opt.is_correct ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                                                            {/* IsCorrect Toggle */}
                                                            <button
                                                                onClick={() => {
                                                                    if (q.question_type === 'single_choice' && !opt.is_correct) {
                                                                        q.options.forEach(o => {
                                                                            if (o.is_correct) handleUpdateOption(q.id, o.id, { is_correct: false });
                                                                        });
                                                                    }
                                                                    handleUpdateOption(q.id, opt.id, { is_correct: !opt.is_correct });
                                                                }}
                                                                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${opt.is_correct ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>

                                                            {/* Option Text */}
                                                            <input
                                                                type="text"
                                                                value={opt.text}
                                                                onChange={(e) => handleUpdateOption(q.id, opt.id, { text: e.target.value })}
                                                                className={`flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold ${opt.is_correct ? 'text-emerald-900' : 'text-[#001c4d]'}`}
                                                            />

                                                            {/* Delete Option */}
                                                            <button
                                                                onClick={() => handleDeleteOption(q.id, opt.id)}
                                                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {q.options.filter(o => !o.isDeleted).length === 0 && (
                                                        <div className="py-6 text-center opacity-40 italic text-xs">Sin opciones registradas.</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamEditor;
