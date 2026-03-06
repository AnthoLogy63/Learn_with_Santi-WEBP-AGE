import { useAppContext } from "@/context/AppContext";
import { LogOut, ClipboardList, BarChart3, Edit3 } from "lucide-react";

interface AdminProfileProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const AdminProfile = ({ activeTab, setActiveTab }: AdminProfileProps) => {
    const { user, logout } = useAppContext();

    if (!user) return null;

    const initials = user.username.slice(0, 2).toUpperCase();

    // Generate deterministic color from username
    const hash = user.username.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const palette = [
        ['#001c4d', '#3b82f6'], // navy/blue
        ['#065f46', '#10b981'], // green
        ['#7c3aed', '#a78bfa'], // purple
        ['#b45309', '#fbbf24'], // amber
        ['#9f1239', '#f43f5e'], // rose
        ['#0369a1', '#38bdf8'], // sky
    ];
    const [bgColor, textColor] = palette[hash % palette.length];

    const navItems = [
        { id: 'management', label: 'Probar Exámenes', icon: ClipboardList },
        { id: 'results', label: 'Ver Resultados', icon: BarChart3 },
        { id: 'edit', label: 'Editar Evaluaciones', icon: Edit3, placeholder: true },
    ];

    return (
        <div className="animate-slide-in flex flex-col h-full">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-6">
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black mb-3 relative shadow-xl select-none"
                    style={{ backgroundColor: bgColor, color: textColor }}
                >
                    {initials}
                </div>

                <div className="bg-[#001c4d] px-4 py-1 rounded-full mb-2 shadow-md">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Administrador</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    @{user.username}
                </h3>
            </div>

            {/* Admin Navigation */}
            <div className="space-y-2 mb-6">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => !item.placeholder && setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 group shadow-sm ${activeTab === item.id
                            ? "bg-[#001c4d] border-[#001c4d] text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:border-[#001c4d]/20 hover:bg-slate-50"
                            } ${item.placeholder ? "opacity-60 cursor-not-allowed" : ""}`}
                        disabled={item.placeholder}
                    >
                        <item.icon className={`h-5 w-5 ${activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-[#001c4d]"}`} />
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
                            {item.placeholder && <span className="text-[10px] font-bold mt-1 text-slate-500">Próximamente</span>}
                        </div>
                    </button>
                ))}
            </div>

            {/* Logout */}
            <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-400 bg-white text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500 transition-all duration-300 shadow-sm mt-4"
            >
                <LogOut className="h-4 w-4 text-red-500" />
                Cerrar sesión
            </button>
        </div>
    );
};

export default AdminProfile;
