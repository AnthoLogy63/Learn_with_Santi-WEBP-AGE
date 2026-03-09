import { useState, useEffect } from "react";
import { examService } from "@/api/examService";
import { Loader2, User as UserIcon, ClipboardList, CheckCircle2, XCircle, ChevronRight, BarChart3, Users, Search, ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";

const ResultsDashboard = () => {
    const [activeTab, setActiveTab] = useState<"person" | "evaluation">("person");
    const [userResults, setUserResults] = useState<any[]>([]);
    const [statsSummary, setStatsSummary] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [search, setSearch] = useState("");
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [viewingExamDetail, setViewingExamDetail] = useState<{ examId: number, examName: string } | null>(null);
    const [selectedExam, setSelectedExam] = useState<any | null>(null);

    const fetchData = async (reset = false, searchStr = search) => {
        if (reset) {
            setLoading(true);
            setOffset(0);
        } else {
            setLoadingMore(true);
        }

        try {
            const currentOffset = reset ? 0 : offset;
            const usersRes = await examService.getUserResults(searchStr, currentOffset);

            if (usersRes.ok) {
                const uData = await usersRes.json();
                if (reset) {
                    setUserResults(uData.results);
                } else {
                    setUserResults(prev => [...prev, ...uData.results]);
                }
                setHasMore(uData.has_more);
                setOffset(currentOffset + 10);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
            toast.error("Error al cargar los resultados");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const fetchStats = async () => {
        try {
            const statsRes = await examService.getStatsSummary();
            if (statsRes && statsRes.ok) {
                const sData = await statsRes.json();
                setStatsSummary(sData);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    // Initial load for stats AND users
    useEffect(() => {
        fetchStats();
        fetchData(true, "");
    }, []);

    // Debounced search for users ONLY
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== "") {
                fetchData(true);
            } else {
                // If search is cleared, fetch initial empty search
                fetchData(true, "");
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchData(false);
        }
    };

    // Helper to group attempts by exam for a user
    const getGroupedAttempts = (attempts: any[]) => {
        const groups: Record<number, any> = {};
        attempts.forEach(attempt => {
            if (!groups[attempt.exam_id]) {
                groups[attempt.exam_id] = {
                    name: attempt.exam_name,
                    id: attempt.exam_id,
                    max_score: 0,
                    attempts: []
                };
            }
            groups[attempt.exam_id].attempts.push(attempt);
            if (attempt.score > groups[attempt.exam_id].max_score) {
                groups[attempt.exam_id].max_score = attempt.score;
            }
        });
        return Object.values(groups);
    };

    const handleExport = async (examId: number, examName: string) => {
        try {
            const response = await examService.exportResults(examId);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `resultados_${examName.replace(/\s+/g, "_").toLowerCase()}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success("Descarga iniciada");
            } else {
                toast.error("Error al exportar los datos");
            }
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Error al conectar con el servidor");
        }
    };

    if (loading && offset === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-white mb-4" />
                <p className="text-white/60 font-medium">Cargando analíticas...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in p-2 md:p-0">
            <header className="mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-2 md:mb-3 drop-shadow-lg">
                    Resultados y Analíticas
                </h1>
                <p className="text-base md:text-lg lg:text-xl text-white/80 max-w-2xl leading-relaxed">
                    Monitorea el progreso de los analistas y el rendimiento de las evaluaciones.
                </p>
            </header>

            {/* Tabs */}
            <div className="flex flex-col gap-4 mb-6 md:mb-8">
                <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl w-full md:w-fit">
                    <button
                        onClick={() => { setActiveTab("person"); setSelectedUser(null); setViewingExamDetail(null); }}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all ${activeTab === "person" ? "bg-white text-[#001c4d] shadow-lg" : "text-white/60 hover:text-white"}`}
                    >
                        <Users className="h-4 w-4" />
                        PERSONAS
                    </button>
                    <button
                        onClick={() => { setActiveTab("evaluation"); setSelectedExam(null); }}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all ${activeTab === "evaluation" ? "bg-white text-[#001c4d] shadow-lg" : "text-white/60 hover:text-white"}`}
                    >
                        <BarChart3 className="h-4 w-4" />
                        EVALUACIONES
                    </button>
                </div>

                {activeTab === "person" && (
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Buscar analista por usuario..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-medium"
                        />
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

                {/* Lateral List */}
                <div className="lg:col-span-4 space-y-4">
                    <h2 className="text-[10px] md:text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-3 md:mb-4 ml-2">
                        {activeTab === "person" ? "LISTA DE ANALISTAS" : "LISTA DE EXÁMENES"}
                    </h2>

                    <div className="max-h-[400px] lg:max-h-[600px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {activeTab === "person" ? (
                            <>
                                {userResults.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => { setSelectedUser(user); setViewingExamDetail(null); }}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${selectedUser?.id === user.id ? "bg-white border-white text-[#001c4d] shadow-xl" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${selectedUser?.id === user.id ? "bg-[#001c4d]/10" : "bg-white/10"}`}>
                                                <UserIcon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">@{user.username}</p>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${selectedUser?.id === user.id ? "text-[#001c4d]/60" : "text-white/40"}`}>{user.total_score} pts</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 opacity-40" />
                                    </button>
                                ))}
                                {hasMore && (
                                    <button
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="w-full py-3 rounded-xl border border-white/10 text-white/40 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all disabled:opacity-50"
                                    >
                                        {loadingMore ? "Cargando..." : "Cargar más analistas"}
                                    </button>
                                )}
                            </>
                        ) : (
                            statsSummary.map((exam) => (
                                <button
                                    key={exam.id}
                                    onClick={() => setSelectedExam(exam)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${selectedExam?.id === exam.id ? "bg-white border-white text-[#001c4d] shadow-xl" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${selectedExam?.id === exam.id ? "bg-[#001c4d]/10" : "bg-white/10"}`}>
                                            <ClipboardList className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{exam.name}</p>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${selectedExam?.id === exam.id ? "text-[#001c4d]/60" : "text-white/40"}`}>{exam.total_attempts} analistas</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 opacity-40" />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Details Panel */}
                <div className="lg:col-span-8">
                    {activeTab === "person" ? (
                        selectedUser ? (
                            <div className="bg-white rounded-3xl p-5 md:p-8 shadow-2xl text-[#001c4d] min-h-[400px] animate-fade-in border border-white animate-in slide-in-from-right-4 overflow-hidden flex flex-col">
                                <header className="border-b border-slate-100 pb-5 md:pb-6 mb-6 md:mb-8 flex flex-wrap justify-between items-start gap-4">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        {viewingExamDetail && (
                                            <button
                                                onClick={() => setViewingExamDetail(null)}
                                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                                            >
                                                <ArrowLeft className="h-5 w-5" />
                                            </button>
                                        )}
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black tracking-tight mb-1">@{selectedUser.username}</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {viewingExamDetail ? `Detalle: ${viewingExamDetail.examName}` : "Resumen de Evaluaciones"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-[#001c4d] text-white px-4 md:px-5 py-2 rounded-2xl text-center shadow-lg">
                                        <p className="text-xl md:text-2xl font-black">{selectedUser.total_score}</p>
                                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Pts Totales</p>
                                    </div>
                                </header>

                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar-dark">
                                    {!viewingExamDetail ? (
                                        /* Grouped View (By Exam) */
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {getGroupedAttempts(selectedUser.attempts).map((group: any) => (
                                                <button
                                                    key={group.id}
                                                    onClick={() => setViewingExamDetail({ examId: group.id, examName: group.name })}
                                                    className="p-5 md:p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all text-left"
                                                >
                                                    <h4 className="font-black text-base md:text-lg mb-4 leading-tight">{group.name}</h4>
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mejor Puntaje</p>
                                                            <p className="text-xl md:text-2xl font-black text-emerald-600">{group.max_score} pts</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Intentos</p>
                                                            <p className="font-bold text-slate-600">{group.attempts.length}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                            {selectedUser.attempts.length === 0 && (
                                                <div className="col-span-full py-20 text-center opacity-40">
                                                    <p className="font-bold">Este analista aún no ha realizado ninguna evaluación.</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Detailed View (Attempts of a specific exam) */
                                        <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4">
                                            {selectedUser.attempts
                                                .filter((a: any) => a.exam_id === viewingExamDetail.examId)
                                                .map((attempt: any, idx: number) => (
                                                    <div key={idx} className={`bg-slate-50 rounded-2xl p-5 md:p-6 border ${attempt.counts_for_score ? 'border-amber-200' : 'border-slate-200'}`}>
                                                        <div className="flex justify-between items-center mb-6">
                                                            <div>
                                                                <h4 className="font-black text-lg">Intento {attempt.attempt_number}</h4>
                                                                <div className="flex gap-2 items-center">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                                        {new Date(attempt.date).toLocaleDateString()}
                                                                    </span>
                                                                    {attempt.counts_for_score && <span className="text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Puntuable</span>}
                                                                </div>
                                                            </div>
                                                            <span className="text-lg md:text-xl font-black text-emerald-600 bg-emerald-50 px-3 md:px-4 py-1 rounded-xl border border-emerald-100">{attempt.score} pts</span>
                                                        </div>

                                                        <div className="space-y-3 md:space-y-4">
                                                            {attempt.answers.map((ans: any, aIdx: number) => (
                                                                <div key={aIdx} className="flex gap-3 md:gap-4 items-start p-3 md:p-4 rounded-xl bg-white border border-slate-100">
                                                                    <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${ans.is_correct ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                                                                        {ans.is_correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-bold leading-snug mb-2">{ans.question}</p>
                                                                        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">
                                                                            <span className="text-slate-400">Respuesta:</span>{" "}
                                                                            <span className={ans.is_correct ? "text-emerald-600" : "text-red-500"}>{ans.selected}</span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[300px] flex items-center justify-center p-10 md:p-20 bg-white/5 rounded-3xl border border-dashed border-white/20">
                                <p className="text-white/40 font-bold text-center uppercase tracking-widest text-xs md:text-sm">Selecciona un analista para ver sus detalles</p>
                            </div>
                        )
                    ) : (
                        selectedExam ? (
                            <div className="bg-white rounded-3xl p-5 md:p-8 shadow-2xl text-[#001c4d] min-h-[400px] animate-fade-in border border-white animate-in slide-in-from-right-4 flex flex-col">
                                <header className="border-b border-slate-100 pb-5 md:pb-6 mb-6 md:mb-8 flex flex-col gap-6">
                                    <div className="flex flex-wrap justify-between items-start gap-4">
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black tracking-tight mb-1">{selectedExam.name}</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumen de Rendimiento General</p>
                                        </div>
                                        <button
                                            onClick={() => handleExport(selectedExam.id, selectedExam.name)}
                                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg transition-all"
                                        >
                                            <Download size={16} />
                                            Exportar Resultados (CSV)
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex-1 min-w-[120px] bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                                            <p className="text-xl md:text-2xl font-black">{selectedExam.total_attempts}</p>
                                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Analistas</p>
                                        </div>
                                        <div className="flex-1 min-w-[120px] bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center">
                                            <p className="text-xl md:text-2xl font-black text-amber-600">{selectedExam.avg_score}%</p>
                                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-amber-500">Promedio</p>
                                        </div>
                                    </div>
                                </header>

                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar-dark space-y-12">
                                    {selectedExam.question_stats.map((q: any, idx: number) => (
                                        <div key={idx} className="space-y-6">
                                            <div className="flex justify-between items-start">
                                                <p className="font-black text-sm max-w-lg leading-relaxed">{q.text}</p>
                                                <span className="text-lg font-black text-emerald-600">{q.percent}% de aciertos</span>
                                            </div>

                                            {/* Choice Distribution (Visual bars) */}
                                            <div className="space-y-3">
                                                {q.choices && q.choices.map((choice: any, cIdx: number) => (
                                                    <div key={cIdx} className="space-y-1">
                                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-1">
                                                            <span className={choice.is_correct ? "text-emerald-600" : "text-slate-400"}>
                                                                {choice.text} {choice.is_correct && "✓"}
                                                            </span>
                                                            <span className="text-slate-600">{choice.count} analistas ({choice.percent}%)</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                                            <div
                                                                className={`h-full transition-all duration-1000 ${choice.is_correct ? "bg-emerald-500" : "bg-slate-300"}`}
                                                                style={{ width: `${choice.percent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!q.choices || q.choices.length === 0) && (
                                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-xs text-slate-400">
                                                        Esta pregunta es de tipo abierta o no tiene opciones registradas.
                                                    </div>
                                                )}
                                            </div>
                                            {idx < selectedExam.question_stats.length - 1 && <hr className="border-slate-100" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center p-20 bg-white/5 rounded-3xl border border-dashed border-white/20">
                                <p className="text-white/40 font-bold uppercase tracking-widest">Selecciona una evaluación para ver estadísticas grupales</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultsDashboard;
