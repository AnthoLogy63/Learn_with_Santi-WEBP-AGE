import FondoCaja from "@/media/FondoCaja.webp";
import SantiWebp from "@/media/santi.webp";
import { useState, useEffect } from "react";
import { examService } from "@/api/examService";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, Loader2 } from "lucide-react";

interface Option {
    id: number;
    text: string;
    is_correct: boolean;
}

interface Question {
    id: number;
    text: string;
    image: string | null;
    options: Option[];
    points: number;
    time_limit_seconds: number;
    question_type: "single_choice" | "multiple_choice" | "open_ended";
}

interface AdminExamPreviewProps {
    examId: number;
    examName: string;
    onClose: () => void;
}

/**
 * Modo revisión del examen para el admin.
 * - Las respuestas correctas se muestran desde el principio (verde).
 * - Sin animaciones de transición ni memes intermedios.
 * - Sin envío real de respuestas ni conteo de puntos.
 * - Los memes (tarjeta feliz/triste) aparecen solo al final como resumen visual.
 */
const AdminExamPreview = ({ examId, examName, onClose }: AdminExamPreviewProps) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await examService.getAllQuestions(String(examId));
                if (res.ok) {
                    const data = await res.json();
                    setQuestions(data.questions);
                }
            } catch (err) {
                console.error("Error al cargar preguntas:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [examId]);

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001c4d]/95 backdrop-blur-xl">
                <Loader2 className="h-10 w-10 animate-spin text-white mb-4" />
                <p className="text-white/60 font-medium ml-3">Cargando vista previa...</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#001c4d]/95 backdrop-blur-xl text-white">
                <p className="text-white/60 text-lg mb-6">No hay preguntas en este examen.</p>
                <button onClick={onClose} className="px-6 py-3 rounded-xl bg-white text-[#001c4d] font-bold">
                    Cerrar
                </button>
            </div>
        );
    }

    // ── Pantalla de resultados (solo tarjetas Santi) ──────────────────────────
    if (showResults) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center px-4"
                style={{ backgroundImage: `url(${FondoCaja})`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                <div className="relative z-10 w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl">
                    {/* Badge modo revisión */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-6">
                        <Eye className="h-3.5 w-3.5 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Modo Revisión</span>
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2">Vista previa completada</h2>
                    <p className="text-white/50 text-sm mb-8">
                        Revisaste las {questions.length} preguntas de <strong className="text-white">{examName}</strong>.<br />
                        No se registraron respuestas ni se modificaron puntos.
                    </p>

                    {/* Imagen de Santi como resumen visual */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <img
                                src={SantiWebp}
                                alt="Santi"
                                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-400/40 shadow-[0_0_40px_rgba(99,102,241,0.3)]"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-indigo-500 rounded-full p-1.5 shadow-lg">
                                <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Resumen de preguntas */}
                    <div className="grid grid-cols-3 gap-3 mb-8 text-center">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                            <p className="text-2xl font-black text-white">{questions.length}</p>
                            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">Preguntas</p>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                            <p className="text-2xl font-black text-emerald-400">
                                {questions.filter(q => q.options.some(o => o.is_correct)).length}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-emerald-300/60 font-bold mt-1">Con resp. correcta</p>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                            <p className="text-2xl font-black text-amber-400">
                                {questions.filter(q => !q.options.some(o => o.is_correct) && q.question_type !== 'open_ended').length}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-amber-300/60 font-bold mt-1">De opinión</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-xl bg-white text-[#001c4d] font-black text-sm hover:bg-white/90 transition-all shadow-lg"
                    >
                        Cerrar vista previa
                    </button>
                </div>
            </div>
        );
    }

    // ── Vista de pregunta ────────────────────────────────────────────────────
    const currentQuestion = questions[currentIndex];
    const isOpinionQuest =
        (currentQuestion.question_type === "single_choice" || currentQuestion.question_type === "multiple_choice") &&
        !currentQuestion.options.some((o) => o.is_correct);

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setShowResults(true);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col bg-[#001c4d] text-white overflow-hidden"
            style={{ backgroundImage: `url(${FondoCaja})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

            {/* ── Header ── */}
            <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Cerrar vista previa
                    </button>

                    {/* Badge modo revisión */}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                        <Eye className="h-3 w-3 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Modo Revisión</span>
                    </div>

                    <span className="text-xs font-bold text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        {currentIndex + 1} / {questions.length}
                    </span>
                </div>
            </header>

            {/* ── Progress bar ── */}
            <div className="relative z-10 max-w-4xl mx-auto w-full px-6 pt-4">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* ── Question content ── */}
            <div className="relative z-10 max-w-4xl mx-auto w-full px-6 py-8 flex-1 overflow-y-auto">
                <div key={currentQuestion.id}>
                    {/* Pregunta header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <span className="inline-block text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">
                                Pregunta {currentIndex + 1}
                            </span>
                            <h2 className="text-2xl lg:text-3xl font-bold text-white leading-snug">
                                {currentQuestion.text}
                            </h2>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0 items-end">
                            {currentQuestion.question_type === "multiple_choice" && (
                                <span className="px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                                    Selección Múltiple
                                </span>
                            )}
                            {isOpinionQuest && (
                                <span className="px-3 py-1.5 rounded-full bg-purple-400/10 border border-purple-400/30 text-purple-400 text-[10px] font-black uppercase tracking-widest">
                                    Pregunta de Opinión
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Imagen de pregunta si existe */}
                    {currentQuestion.image && (
                        <div className="mb-6">
                            <img
                                src={currentQuestion.image}
                                alt="Imagen de la pregunta"
                                className="rounded-2xl max-h-64 object-contain border border-white/10"
                            />
                        </div>
                    )}

                    {/* Tipo abierta */}
                    {currentQuestion.question_type === "open_ended" ? (
                        <div className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white/50 text-sm italic">
                            Pregunta de respuesta abierta — los usuarios escriben su respuesta libremente.
                        </div>
                    ) : (
                        /* Opciones: siempre en modo "verificado" para el admin */
                        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                            {currentQuestion.options.map((option, index) => {
                                const letter = String.fromCharCode(65 + index);
                                const isMultiple = currentQuestion.question_type === "multiple_choice";

                                // En modo revisión: verde si es correcta, gris si no
                                let containerStyle: string;
                                let badgeStyle: string;

                                if (isOpinionQuest) {
                                    // Opinión: todas neutras con indicador
                                    containerStyle = "border-purple-400/20 bg-purple-400/5 text-white/70";
                                    badgeStyle = "bg-purple-400/20 text-purple-300";
                                } else if (option.is_correct) {
                                    containerStyle = "border-emerald-500 bg-emerald-500/20 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]";
                                    badgeStyle = "bg-emerald-500 text-white";
                                } else {
                                    containerStyle = "border-white/8 bg-white/5 text-white/40";
                                    badgeStyle = "bg-white/10 text-white/40 border border-white/10";
                                }

                                return (
                                    <div
                                        key={option.id}
                                        className={`w-full text-left p-5 rounded-2xl border transition-none ${containerStyle}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center text-sm font-black ${isMultiple ? "rounded-lg" : "rounded-full"} ${badgeStyle}`}
                                            >
                                                {isMultiple
                                                    ? (option.is_correct ? "✓" : "")
                                                    : letter}
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-base font-bold leading-tight">
                                                    {option.text}
                                                </span>
                                                {option.is_correct && !isOpinionQuest && (
                                                    <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                                        ✓ Correcta
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Info puntos */}
                    <div className="mt-6 flex items-center gap-4 text-xs text-white/30">
                        <span>Puntos: <strong className="text-white/50">{currentQuestion.points}</strong></span>
                        {currentQuestion.time_limit_seconds > 0 && (
                            <span>Tiempo: <strong className="text-white/50">{currentQuestion.time_limit_seconds}s</strong></span>
                        )}
                    </div>
                </div>

                {/* ── Navegación ── */}
                <div className="flex items-center justify-between mt-10 border-t border-white/10 pt-6 gap-4">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/20 text-sm font-bold text-white/60 hover:text-white hover:border-white/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Anterior
                    </button>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black transition-all shadow-lg"
                    >
                        {currentIndex < questions.length - 1 ? "Siguiente" : "Ver resumen"}
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminExamPreview;
