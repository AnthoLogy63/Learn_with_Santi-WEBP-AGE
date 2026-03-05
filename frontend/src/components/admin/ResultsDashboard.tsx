import { useState, useEffect } from "react";
import { examService } from "@/api/examService";
import { Loader2, User as UserIcon, ClipboardList, CheckCircle2, XCircle, ChevronRight, BarChart3, Users } from "lucide-react";
import { toast } from "sonner";

const ResultsDashboard = () => {
    const [activeTab, setActiveTab] = useState<"person" | "evaluation">("person");
    const [userResults, setUserResults] = useState<any[]>([]);
    const [statsSummary, setStatsSummary] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [selectedExam, setSelectedExam] = useState<any | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, statsRes] = await Promise.all([
                examService.getUserResults(),
                examService.getStatsSummary()
            ]);

            if (usersRes.ok && statsRes.ok) {
                const uData = await usersRes.json();
                const sData = await statsRes.json();
                setUserResults(uData);
                setStatsSummary(sData);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
            toast.error("Error al cargar los resultados");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-white mb-4" />
                <p className="text-white/60 font-medium">Cargando analíticas...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3 drop-shadow-lg">
                    Resultados y Analíticas
                </h1>
                <p className="text-lg lg:text-xl text-white/80 max-w-2xl leading-relaxed">
                    Monitorea el progreso de los analistas y el rendimiento de las evaluaciones.
                </p>
            </header>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl w-fit mb-8">
                <button
                    onClick={() => { setActiveTab("person"); setSelectedUser(null); }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === "person" ? "bg-white text-[#001c4d] shadow-lg" : "text-white/60 hover:text-white"}`}
                >
                    <Users className="h-4 w-4" />
                    BUSCAR POR PERSONA
                </button>
                <button
                    onClick={() => { setActiveTab("evaluation"); setSelectedExam(null); }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === "evaluation" ? "bg-white text-[#001c4d] shadow-lg" : "text-white/60 hover:text-white"}`}
                >
                    <BarChart3 className="h-4 w-4" />
                    BUSCAR POR EVALUACIÓN
                </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Lateral List */}
                <div className="lg:col-span-4 space-y-4">
                    <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4 ml-2">
                        {activeTab === "person" ? "LISTA DE ANALISTAS" : "LISTA DE EXÁMENES"}
                    </h2>

                    <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {activeTab === "person" ? (
                            userResults.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
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
                            ))
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
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${selectedExam?.id === exam.id ? "text-[#001c4d]/60" : "text-white/40"}`}>{exam.total_attempts} realizados</p>
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
                            <div className="bg-white rounded-3xl p-8 shadow-2xl text-[#001c4d] min-h-[500px] animate-fade-in border border-white animate-in slide-in-from-right-4">
                                <header className="border-b border-slate-100 pb-6 mb-8 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight mb-1">@{selectedUser.username}</h3>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Resumen detallado del analista</p>
                                    </div>
                                    <div className="bg-[#001c4d] text-white px-5 py-2 rounded-2xl text-center shadow-lg">
                                        <p className="text-2xl font-black">{selectedUser.total_score}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Puntaje Acumulado</p>
                                    </div>
                                </header>

                                <div className="space-y-8">
                                    {selectedUser.attempts.map((attempt: any, idx: number) => (
                                        <div key={idx} className={`bg-slate-50 rounded-2xl p-6 border ${attempt.counts_for_score ? 'border-amber-200' : 'border-slate-200'}`}>
                                            <div className="flex justify-between items-center mb-6">
                                                <div>
                                                    <h4 className="font-black text-lg">{attempt.exam_name}</h4>
                                                    <div className="flex gap-2 items-center">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intento {attempt.attempt_number}</span>
                                                        {attempt.counts_for_score && <span className="text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Puntuable</span>}
                                                    </div>
                                                </div>
                                                <span className="text-xl font-black text-emerald-600 bg-emerald-50 px-4 py-1 rounded-xl border border-emerald-100">{attempt.score} pts</span>
                                            </div>

                                            <div className="space-y-4">
                                                {attempt.answers.map((ans: any, aIdx: number) => (
                                                    <div key={aIdx} className="flex gap-4 items-start p-4 rounded-xl bg-white border border-slate-100">
                                                        <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${ans.is_correct ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                                                            {ans.is_correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-bold leading-snug mb-2">{ans.question}</p>
                                                            <div className="flex gap-4">
                                                                <p className="text-xs font-black uppercase tracking-widest"><span className="text-slate-400">Marcó:</span> {ans.selected}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {selectedUser.attempts.length === 0 && (
                                        <div className="py-20 text-center opacity-40">
                                            <p className="font-bold">Este analista aún no ha realizado ninguna evaluación.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center p-20 bg-white/5 rounded-3xl border border-dashed border-white/20">
                                <p className="text-white/40 font-bold uppercase tracking-widest">Selecciona un analista para ver sus detalles</p>
                            </div>
                        )
                    ) : (
                        selectedExam ? (
                            <div className="bg-white rounded-3xl p-8 shadow-2xl text-[#001c4d] min-h-[500px] animate-fade-in border border-white animate-in slide-in-from-right-4">
                                <header className="border-b border-slate-100 pb-6 mb-8 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight mb-1">{selectedExam.name}</h3>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Rendimiento por Analista (Mejor Intento)</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="bg-[#001c4d] text-white px-5 py-2 rounded-2xl text-center shadow-lg">
                                            <p className="text-2xl font-black">{selectedExam.total_attempts}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Analistas</p>
                                        </div>
                                        <div className="bg-amber-500 text-white px-5 py-2 rounded-2xl text-center shadow-lg">
                                            <p className="text-2xl font-black">{selectedExam.avg_score}%</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Puntaje Prom.</p>
                                        </div>
                                    </div>
                                </header>

                                <div className="space-y-8">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">DESGLOSE POR PREGUNTA</h4>

                                    <div className="grid gap-6">
                                        {selectedExam.question_stats.map((q: any, idx: number) => (
                                            <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                                                <p className="font-bold text-sm mb-4 leading-relaxed">{q.text}</p>

                                                <div className="flex items-center gap-6">
                                                    <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                                                        <div
                                                            className="h-full bg-emerald-500 transition-all duration-700"
                                                            style={{ width: `${q.percent}%` }}
                                                        />
                                                    </div>
                                                    <div className="w-16 text-right">
                                                        <span className="text-lg font-black text-[#001c4d]">{q.percent}%</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between mt-2">
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Aciertos: {q.correct}</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Muestra: {q.total} analistas</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
