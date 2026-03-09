import { useState, useCallback } from "react";
import {
    UploadCloud,
    Download,
    Users,
    FileSpreadsheet,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Loader2,
    Trash2,
    RefreshCcw,
    Info,
    ChevronUp,
    ChevronDown,
    ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { userService, ImportResult } from "@/api/userService";
import { examService, ExamImportResult } from "@/api/examService";

// ─── Sub-tabs ────────────────────────────────────────────────────────────────
type DataTab = "importar" | "exportar";

// ─── Acciones de importación disponibles ─────────────────────────────────────
interface ImportAction {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    available: boolean;
}
const IMPORT_ACTIONS: ImportAction[] = [
    {
        id: "usuarios",
        label: "Importar Usuarios",
        description: "Sube un Excel con los datos de los analistas. Los puntos existentes nunca se modifican.",
        icon: Users,
        color: "from-blue-500 to-indigo-600",
        available: true,
    },
    {
        id: "exams",
        label: "Importar Evaluaciones",
        description: "Crea o reemplaza evaluaciones completas (preguntas y opciones) desde un Excel.",
        icon: ClipboardList,
        color: "from-purple-500 to-pink-600",
        available: true,
    },
];

const EXPORT_ACTIONS: ImportAction[] = [
    {
        id: "resultados",
        label: "Exportar Resultados",
        description: "Descarga un Excel con todos los resultados de los analistas.",
        icon: FileSpreadsheet,
        color: "from-emerald-500 to-teal-600",
        available: false,
    },
    {
        id: "usuarios_export",
        label: "Exportar Usuarios",
        description: "Exporta la lista completa de usuarios registrados.",
        icon: Users,
        color: "from-violet-500 to-purple-600",
        available: false,
    },
];

// ─── Formato de columnas esperadas ──────────────────────────────────────────
const FORMAT_COLUMNS = [
    { col: "ASESOR ANALISTA", desc: "Nombre de usuario (Login)", required: true, example: "jperez" },
    { col: "NUMERO DOCUMENTO", desc: "DNI (Password)", required: true, example: "12345678" },
    { col: "NOMBRE", desc: "Nombre (Opcional)", required: false, example: "Juan" },
    { col: "APELLIDO", desc: "Apellido (Opcional)", required: false, example: "Pérez" },
    { col: "ES_ADMIN", desc: "¿Administrador? (TRUE/FALSE)", required: false, example: "FALSE" },
];

const FORMAT_EXAM_COLUMNS = [
    { col: "exam_name", desc: "Nombre único de la evaluación", required: true, example: "Cumplimiento 2024" },
    { col: "question_text", desc: "Texto de la pregunta", required: true, example: "¿Qué es AML?" },
    { col: "question_type", desc: "single_choice / multiple_choice / open_ended", required: true, example: "single_choice" },
    { col: "option_text", desc: "Texto de la respuesta (vacío en open_ended)", required: true, example: "Anti Lavado de Dinero" },
    { col: "is_correct", desc: "Si la opción es válida (TRUE / FALSE)", required: true, example: "TRUE" },
    { col: "question_points", desc: "Puntos de esta pregunta (default 10)", required: false, example: "20" },
];

// ─── Componente principal ────────────────────────────────────────────────────
const DataManagement = () => {
    const [dataTab, setDataTab] = useState<DataTab>("importar");
    const [activeAction, setActiveAction] = useState<string | null>(null);

    return (
        <div className="space-y-8 p-2 md:p-0 animate-fade-in">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3 drop-shadow-lg">
                    Importar / Exportar Data
                </h1>
                <p className="text-base md:text-lg text-white/70 max-w-2xl leading-relaxed">
                    Gestiona los datos de la plataforma. Importa usuarios desde Excel o exporta resultados.
                </p>
            </header>

            {/* Google-style tabs */}
            <div className="flex border-b border-white/20 mb-8">
                {(["importar", "exportar"] as DataTab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setDataTab(tab); setActiveAction(null); }}
                        className={`px-6 py-3 text-sm font-black uppercase tracking-widest transition-all duration-200 border-b-2 ${dataTab === tab
                            ? "border-white text-white"
                            : "border-transparent text-white/40 hover:text-white/70 hover:border-white/30"
                            }`}
                    >
                        {tab === "importar" ? (
                            <span className="flex items-center gap-2"><UploadCloud className="h-4 w-4" /> Importar</span>
                        ) : (
                            <span className="flex items-center gap-2"><Download className="h-4 w-4" /> Exportar</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Contenido según tab */}
            {dataTab === "importar" && (
                <ActionList
                    actions={IMPORT_ACTIONS}
                    activeAction={activeAction}
                    setActiveAction={setActiveAction}
                    renderPanel={(id) => {
                        if (id === "usuarios") return <ImportUsuariosPanel />;
                        if (id === "exams") return <ImportExamenPanel />;
                        return null;
                    }}
                />
            )}

            {dataTab === "exportar" && (
                <ActionList
                    actions={EXPORT_ACTIONS}
                    activeAction={activeAction}
                    setActiveAction={setActiveAction}
                    renderPanel={() => null}
                />
            )}
        </div>
    );
};

// ─── Lista de acciones ───────────────────────────────────────────────────────
interface ActionListProps {
    actions: ImportAction[];
    activeAction: string | null;
    setActiveAction: (id: string | null) => void;
    renderPanel: (id: string) => React.ReactNode;
}

const ActionList = ({ actions, activeAction, setActiveAction, renderPanel }: ActionListProps) => {
    return (
        <div className="space-y-4">
            {actions.map((action) => {
                const Icon = action.icon;
                const isOpen = activeAction === action.id;

                return (
                    <div
                        key={action.id}
                        className={`rounded-2xl border overflow-hidden transition-all duration-300 ${action.available
                            ? "border-white/20 bg-white/10 backdrop-blur-md"
                            : "border-white/10 bg-white/5 opacity-60 cursor-not-allowed"
                            }`}
                    >
                        {/* Header del acordeón */}
                        <button
                            className="w-full flex items-center justify-between p-5 text-left"
                            onClick={() => {
                                if (!action.available) return;
                                setActiveAction(isOpen ? null : action.id);
                            }}
                            disabled={!action.available}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-lg`}>
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-base">{action.label}</p>
                                    <p className="text-white/50 text-xs mt-0.5">{action.description}</p>
                                    {!action.available && (
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 mt-1 block">
                                            Próximamente
                                        </span>
                                    )}
                                </div>
                            </div>
                            {action.available && (
                                isOpen
                                    ? <ChevronUp className="h-5 w-5 text-white/60 flex-shrink-0" />
                                    : <ChevronDown className="h-5 w-5 text-white/60 flex-shrink-0" />
                            )}
                        </button>

                        {/* Panel expandido */}
                        {isOpen && action.available && (
                            <div className="border-t border-white/10 p-5">
                                {renderPanel(action.id)}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ─── Panel: Importar Usuarios ─────────────────────────────────────────────────
const ImportUsuariosPanel = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [showFormat, setShowFormat] = useState(true);

    // Limpieza por inactividad
    const [cleanupMonths, setCleanupMonths] = useState(2);
    const [cleanupLoading, setCleanupLoading] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped?.name.endsWith('.xlsx')) {
            setFile(dropped);
            setResult(null);
        } else {
            toast.error("Solo se aceptan archivos .xlsx");
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        setResult(null);
        try {
            const res = await userService.importUsers(file);
            const data = await res.json();
            if (res.ok) {
                setResult(data);
                if (data.errores?.length === 0) {
                    toast.success(`Importación completada: ${data.creados} creados, ${data.actualizados} actualizados`);
                } else {
                    toast.warning(`Importación con ${data.errores.length} error(es)`);
                }
            } else {
                toast.error(data.error || "Error en la importación");
            }
        } catch {
            toast.error("No se pudo conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };

    const handleCleanup = async () => {
        const confirmed = window.confirm(
            `¿Confirmas que deseas ELIMINAR todos los usuarios inactivos por más de ${cleanupMonths} mes(es)?\n⚠️ Esta acción es IRREVERSIBLE. Los administradores no se verán afectados.`
        );
        if (!confirmed) return;

        setCleanupLoading(true);
        try {
            const res = await userService.cleanupInactive(cleanupMonths, true);
            const data = await res.json();
            if (res.ok) {
                toast.success(data.mensaje);
            } else {
                toast.error("Error al ejecutar la limpieza");
            }
        } catch {
            toast.error("No se pudo conectar con el servidor");
        } finally {
            setCleanupLoading(false);
        }
    };

    return (
        <div className="space-y-6">

            {/* ── Formato esperado ── */}
            <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => setShowFormat(!showFormat)}
                >
                    <span className="flex items-center gap-2 text-sm font-bold text-white/80">
                        <Info className="h-4 w-4 text-blue-400" />
                        Formato requerido del Excel
                    </span>
                    {showFormat ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
                </button>

                {showFormat && (
                    <div className="px-4 pb-4 space-y-3">
                        <p className="text-xs text-white/50">
                            El archivo debe ser <span className="text-white font-bold">.xlsx</span>. La primera fila debe ser el encabezado con exactamente estos nombres de columna:
                        </p>
                        <div className="overflow-x-auto rounded-lg border border-white/10">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-white/10">
                                        <th className="text-left px-3 py-2 text-white/70 font-black uppercase tracking-wider">Columna</th>
                                        <th className="text-left px-3 py-2 text-white/70 font-black uppercase tracking-wider">Descripción</th>
                                        <th className="text-left px-3 py-2 text-white/70 font-black uppercase tracking-wider">Ejemplo</th>
                                        <th className="text-center px-3 py-2 text-white/70 font-black uppercase tracking-wider">Req.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {FORMAT_COLUMNS.map((col, i) => (
                                        <tr key={col.col} className={i % 2 === 0 ? "bg-white/5" : ""}>
                                            <td className="px-3 py-2">
                                                <code className="text-blue-300 font-bold">{col.col}</code>
                                            </td>
                                            <td className="px-3 py-2 text-white/60">{col.desc}</td>
                                            <td className="px-3 py-2 text-emerald-300">{col.example}</td>
                                            <td className="px-3 py-2 text-center">
                                                {col.required
                                                    ? <span className="text-red-400 font-black">✓</span>
                                                    : <span className="text-white/30">—</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-300">
                            <strong>Importante:</strong> El DNI funciona como contraseña de inicio de sesión. Si el usuario ya existe (mismo DNI), sus datos se actualizan pero sus puntos y ranking <strong>nunca se modifican</strong>.
                        </div>
                    </div>
                )}
            </div>

            {/* ── Drop zone ── */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="relative border-2 border-dashed border-white/30 rounded-2xl p-8 text-center hover:border-white/60 hover:bg-white/5 transition-all duration-200 cursor-pointer group"
                onClick={() => document.getElementById('excel-input')?.click()}
            >
                <input
                    id="excel-input"
                    type="file"
                    accept=".xlsx"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <UploadCloud className="h-10 w-10 text-white/30 group-hover:text-white/60 mx-auto mb-3 transition-colors" />
                {file ? (
                    <div>
                        <p className="text-white font-bold text-sm">{file.name}</p>
                        <p className="text-white/40 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB — Click para cambiar</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-white/60 font-semibold text-sm">Arrastra tu archivo Excel aquí</p>
                        <p className="text-white/30 text-xs mt-1">o haz click para seleccionar — Solo .xlsx</p>
                    </div>
                )}
            </div>

            {/* ── Botón importar ── */}
            <button
                onClick={handleImport}
                disabled={!file || loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-lg hover:from-blue-400 hover:to-indigo-500 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</>
                    : <><UploadCloud className="h-4 w-4" /> Importar Usuarios</>
                }
            </button>

            {/* ── Resultado ── */}
            {result && (
                <div className="rounded-2xl border border-white/20 bg-white/5 p-5 space-y-4 animate-fade-in">
                    <p className="text-white font-black text-sm uppercase tracking-widest mb-3">Resultado de la importación</p>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                            <p className="text-2xl font-black text-emerald-400">{result.creados}</p>
                            <p className="text-[10px] text-emerald-300/70 uppercase tracking-widest font-bold">Creados</p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                            <RefreshCcw className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                            <p className="text-2xl font-black text-blue-400">{result.actualizados}</p>
                            <p className="text-[10px] text-blue-300/70 uppercase tracking-widest font-bold">Actualizados</p>
                        </div>
                        <div className={`rounded-xl p-3 text-center border ${result.errores.length > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/10'}`}>
                            <XCircle className={`h-5 w-5 mx-auto mb-1 ${result.errores.length > 0 ? 'text-red-400' : 'text-white/30'}`} />
                            <p className={`text-2xl font-black ${result.errores.length > 0 ? 'text-red-400' : 'text-white/30'}`}>{result.errores.length}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Errores</p>
                        </div>
                    </div>

                    {result.errores.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 space-y-1">
                            <p className="text-xs font-black text-red-300 uppercase tracking-widest mb-2">
                                <AlertTriangle className="h-3 w-3 inline mr-1" />Filas con error
                            </p>
                            {result.errores.map((e, i) => (
                                <p key={i} className="text-xs text-red-200/70">
                                    Fila {e.fila}: {e.motivo}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Limpieza de inactivos ── */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 space-y-4 mt-4">
                <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <p className="text-sm font-black text-red-300 uppercase tracking-widest">Eliminar usuarios inactivos</p>
                </div>
                <p className="text-xs text-white/50">
                    Elimina permanentemente a los usuarios que no hayan iniciado sesión en el período indicado. Los administradores <strong>nunca</strong> se ven afectados. Esta acción es <strong>irreversible</strong>.
                </p>

                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Meses de inactividad</label>
                        <select
                            value={cleanupMonths}
                            onChange={(e) => setCleanupMonths(Number(e.target.value))}
                            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-white/50"
                        >
                            {[1, 2, 3, 6, 12].map(m => (
                                <option key={m} value={m} className="bg-[#001c4d]">{m} {m === 1 ? 'mes' : 'meses'}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleCleanup}
                        disabled={cleanupLoading}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow bg-red-600 hover:bg-red-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {cleanupLoading
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <Trash2 className="h-3 w-3" />
                        }
                        {cleanupLoading ? 'Procesando...' : 'Eliminar inactivos'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Panel: Importar Evaluaciones ──────────────────────────────────────────────
const ImportExamenPanel = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ExamImportResult | null>(null);
    const [showFormat, setShowFormat] = useState(true);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped?.name.endsWith('.xlsx')) {
            setFile(dropped);
            setResult(null);
        } else {
            toast.error("Solo se aceptan archivos .xlsx");
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        setResult(null);
        try {
            const res = await examService.importExam(file);
            const data = await res.json();
            if (res.ok) {
                setResult(data);
                toast.success(`Evaluación '${data.exam_name}' importada con éxito (${data.modo})`);
            } else {
                toast.error(data.error || "Error en la importación");
            }
        } catch {
            toast.error("No se pudo conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Formato esperado */}
            <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => setShowFormat(!showFormat)}
                >
                    <span className="flex items-center gap-2 text-sm font-bold text-white/80">
                        <Info className="h-4 w-4 text-purple-400" />
                        Guía de formato para Evaluaciones
                    </span>
                    {showFormat ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
                </button>

                {showFormat && (
                    <div className="px-4 pb-4 space-y-4">
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-4 py-3">
                            <p className="text-xs text-indigo-300 leading-relaxed font-bold">
                                💡 ¿Cómo meter 4 respuestas para una misma pregunta?
                            </p>
                            <p className="text-[11px] text-indigo-200/70 mt-1 leading-relaxed">
                                Debes crear <strong className="text-white">4 filas seguidas</strong> con el mismo <code className="text-white bg-white/10 px-1 rounded">question_text</code>. Cada fila llevará una de las opciones en <code className="text-white bg-white/10 px-1 rounded">option_text</code>. El sistema las agrupará automáticamente.
                            </p>
                        </div>

                        <p className="text-xs text-white/50 leading-relaxed">
                            Asegúrate de que la primera fila del examen contenga el <strong>nombre y descripción</strong> del mismo. Si dejas la columna de pregunta vacía en las filas siguientes, se asignarán a la última pregunta detectada.
                        </p>
                        <div className="overflow-x-auto rounded-lg border border-white/10">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-white/10">
                                        <th className="text-left px-3 py-2 text-white/70 uppercase tracking-wider">Columna</th>
                                        <th className="text-left px-3 py-2 text-white/70 uppercase tracking-wider">Descripción</th>
                                        <th className="text-left px-3 py-2 text-white/70 uppercase tracking-wider">Ejemplo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {FORMAT_EXAM_COLUMNS.map((col, i) => (
                                        <tr key={col.col} className={i % 2 === 0 ? "bg-white/5" : ""}>
                                            <td className="px-3 py-2"><code className="text-purple-300 font-bold">{col.col}</code></td>
                                            <td className="px-3 py-2 text-white/60">{col.desc}</td>
                                            <td className="px-3 py-2 text-emerald-300 italic">{col.example}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="text-[10px] text-white/30 italic">
                            * También puedes incluir: <code>exam_description</code>, <code>questions_per_attempt</code>, <code>max_scored_attempts</code>, <code>max_points</code>, <code>time_limit_seconds</code>.
                        </div>
                    </div>
                )}
            </div>

            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="relative border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer group"
                onClick={() => document.getElementById('exam-excel-input')?.click()}
            >
                <input
                    id="exam-excel-input"
                    type="file"
                    accept=".xlsx"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <UploadCloud className="h-10 w-10 text-white/20 group-hover:text-purple-400 mx-auto mb-3 transition-colors" />
                {file ? (
                    <div>
                        <p className="text-white font-bold text-sm tracking-tight">{file.name}</p>
                        <p className="text-purple-400 text-[10px] font-black uppercase mt-1">Archivo listo para procesar</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-white/60 font-semibold text-sm">Sube el Excel de la evaluación</p>
                        <p className="text-white/30 text-[10px] uppercase tracking-widest mt-1 font-bold">Máximo 10MB • Formato .xlsx</p>
                    </div>
                )}
            </div>

            {/* Botón importar */}
            <button
                onClick={handleImport}
                disabled={!file || loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-black text-sm uppercase tracking-widest shadow-xl hover:scale-[0.98] transition-all disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-3"
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                {loading ? 'Procesando archivo...' : 'Importar Evaluación'}
            </button>

            {/* Resultado */}
            {result && (
                <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-6 space-y-5 animate-scale-in">
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <p className="text-white font-black text-xs uppercase tracking-[0.2em]">Examen {result.modo === 'creado' ? 'Nuevo' : 'Actualizado'}</p>
                        </div>
                        <span className="text-xs font-bold text-white/60">{result.exam_name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <p className="text-2xl font-black text-white">{result.preguntas_creadas}</p>
                            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Preguntas</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <p className="text-2xl font-black text-white">{result.opciones_creadas}</p>
                            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Opciones Totales</p>
                        </div>
                    </div>

                    {result.errores.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                            <p className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                <AlertTriangle className="h-4 w-4" /> Conflictos detectados
                            </p>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {result.errores.map((err, i) => (
                                    <p key={i} className="text-[11px] text-red-300/80 leading-relaxed">• {err}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DataManagement;
