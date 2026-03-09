import { useAppContext } from "@/context/AppContext";
import { Trophy, LogOut } from "lucide-react";

const UserProfile = () => {
  const { user, logout, exams } = useAppContext();

  if (!user) return null;

  const completedCount = exams.filter((e) => e.status === "completed").length;
  const initials = user.username.slice(0, 2).toUpperCase();

  // Generate deterministic color from username (reusing AdminProfile logic)
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

  return (
    <div className="animate-slide-in">
      {/* Avatar */}
      <div className="flex flex-col items-center text-center mb-4 lg:mb-6">
        <div
          className="w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center text-2xl lg:text-3xl font-black mb-3 relative overflow-hidden shadow-xl select-none"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          {user.current_rank?.badge_image ? (
            <img
              src={user.current_rank.badge_image}
              alt={user.current_rank.name}
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        <h3 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight">
          @{user.username}
        </h3>

        {user.current_rank && (
          <p className="text-[10px] lg:text-xs font-black text-amber-600 uppercase tracking-[0.2em] mt-1">
            {user.current_rank.name}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-6 lg:mb-8">
        <div className="flex items-center justify-between p-3 lg:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm group hover:border-[#001c4d]/20 transition-all duration-300">
          <div className="flex items-center gap-2 lg:gap-3">
            <Trophy className="h-4 w-4 lg:h-5 lg:w-5 text-amber-500" />
            <span className="text-[10px] lg:text-xs font-black text-slate-500 uppercase tracking-widest">Puntos</span>
          </div>
          <span className="text-xl lg:text-2xl font-black text-[#001c4d] tracking-tight">{user.total_score}</span>
        </div>

        <div className="flex items-center justify-between p-3 lg:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm group hover:border-[#001c4d]/20 transition-all duration-300">
          <span className="text-[10px] lg:text-xs font-black text-slate-500 uppercase tracking-widest">Exámenes</span>
          <span className="text-xs lg:text-sm font-black text-[#001c4d] px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200">
            {completedCount} / {exams.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 lg:mb-8 p-3 lg:p-4 rounded-2xl bg-blue-200/30 border border-blue-300 shadow-md overflow-hidden hover:bg-blue-200/40 hover:scale-[1.03] transition-all duration-300 group/progress">
        <div className="flex justify-between items-center mb-2 text-blue-900">
          <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest opacity-70 group-hover/progress:opacity-100">
            Progreso
          </span>
          <span className="text-[9px] lg:text-[10px] font-black px-1.5 py-0.5 rounded-lg bg-white/70 border border-blue-300">
            {exams.length > 0 ? Math.round((completedCount / exams.length) * 100) : 0}%
          </span>
        </div>

        <div className="h-2.5 lg:h-3.5 bg-white/40 rounded-full overflow-hidden p-[2px] shadow-inner border border-blue-200/50">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out shadow-md group-hover/progress:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
            style={{ width: `${exams.length > 0 ? (completedCount / exams.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-2.5 lg:py-3 rounded-2xl border-2 border-red-400 bg-white text-xs lg:text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500 transition-all duration-300 shadow-sm"
      >
        <LogOut className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-red-500" />
        Cerrar sesión
      </button>
    </div>
  );
};

export default UserProfile;
