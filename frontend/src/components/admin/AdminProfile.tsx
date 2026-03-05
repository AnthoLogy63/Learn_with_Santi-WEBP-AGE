import { useAppContext } from "@/context/AppContext";
import Foto from "@/media/foto.jpg";
import { LogOut, ClipboardList, BarChart3, Edit3 } from "lucide-react";

interface AdminProfileProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const AdminProfile = ({ activeTab, setActiveTab }: AdminProfileProps) => {
    const { user, logout } = useAppContext();

    if (!user) return null;

    const initials = user.username.slice(0, 2).toUpperCase();

    const navItems = [
        { id: 'management', label: 'Probar Exámenes', icon: ClipboardList },
        { id: 'results', label: 'Ver Resultados', icon: BarChart3 },
        { id: 'edit', label: 'Editar Evaluaciones', icon: Edit3, placeholder: true },
    ];

    return (
        <div className="animate-slide-in">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-10">
                <div className="w-24 h-24 rounded-full bg-slate-200 border-2 border-white text-[#001c4d] flex items-center justify-center text-3xl font-bold mb-4 relative overflow-hidden shadow-xl">
                    {user.current_rank?.badge_image ? (
                        <img
                            src={user.current_rank.badge_image}
                            alt={user.current_rank.name}
                            className="w-full h-full object-cover"
                        />
                    ) : Foto ? (
                        <img
                            src={Foto}
                            alt="Perfil"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        initials
                    )}
                </div>

                <div className="bg-[#001c4d] px-4 py-1 rounded-full mb-2 shadow-md">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Administrador</span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    @{user.username}
                </h3>
            </div>

            {/* Admin Navigation */}
            <div className="space-y-4 mb-10">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => !item.placeholder && setActiveTab(item.id)}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-300 group shadow-sm ${activeTab === item.id
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
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-red-400 bg-white text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500 transition-all duration-300 shadow-sm mt-10"
            >
                <LogOut className="h-4 w-4 text-red-500" />
                Cerrar sesión
            </button>
        </div>
    );
};

export default AdminProfile;
