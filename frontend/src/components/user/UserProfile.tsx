import { useAppContext } from "@/context/AppContext";
import Foto from "@/media/foto.jpg";
import { Trophy, LogOut } from "lucide-react";

const UserProfile = () => {
  const { user, logout, exams } = useAppContext();

  if (!user) return null;

  const completedCount = exams.filter((e) => e.status === "completed").length;
  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <div className="animate-slide-in">
      {/* Avatar */}
      <div className="flex flex-col items-center text-center mb-8">
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

        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          @{user.username}
        </h3>

        {user.current_rank && (
          <p className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] mt-1.5">
            {user.current_rank.name}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-4 mb-10">
        <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 shadow-sm group hover:border-[#001c4d]/20 transition-all duration-300">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Puntos totales</span>
          </div>
          <span className="text-2xl font-black text-[#001c4d] tracking-tight">{user.total_score}</span>
        </div>

        <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 shadow-sm group hover:border-[#001c4d]/20 transition-all duration-300">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Exámenes</span>
          <span className="text-sm font-black text-[#001c4d] px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
            {completedCount} / {exams.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
<div className="mb-10 p-5 rounded-2xl bg-blue-200/30 border border-blue-300 shadow-md overflow-hidden hover:bg-blue-200/40 hover:scale-[1.03] transition-all duration-300 group/progress">
  <div className="flex justify-between items-center mb-3 text-blue-900">
    <span className="text-xs font-black uppercase tracking-widest opacity-70 group-hover/progress:opacity-100">
      Progreso de nivel
    </span>
    <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-white/70 border border-blue-300">
      {exams.length > 0 ? Math.round((completedCount / exams.length) * 100) : 0}%
    </span>
  </div>

  <div className="h-3.5 bg-white/40 rounded-full overflow-hidden p-[2px] shadow-inner border border-blue-200/50">
    <div
      className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out shadow-md group-hover/progress:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
      style={{ width: `${exams.length > 0 ? (completedCount / exams.length) * 100 : 0}%` }}
    />
  </div>
</div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-red-400 bg-white text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500 transition-all duration-300 shadow-sm"
      >
        <LogOut className="h-4 w-4 text-red-500" />
        Cerrar sesión
      </button>
    </div>
  );
};

export default UserProfile;
