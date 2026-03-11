import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Trophy, LogOut, ShoppingBag, Medal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userService } from "@/api/userService";
import profilePic from "@/media/foto.jpg";

const UserProfile = () => {
  const { user, logout, exams } = useAppContext();
  const navigate = useNavigate();
  const [rankingInfo, setRankingInfo] = useState<{ rank: number, total: number } | null>(null);

  useEffect(() => {
    const fetchRank = async () => {
      try {
        const res = await userService.getRanking();
        if (res.ok) {
          const data = await res.json();
          setRankingInfo({ rank: data.user_rank, total: data.total_users });
        }
      } catch (error) {
        console.error("Error fetching rank:", error);
      }
    };
    if (user) fetchRank();
  }, [user]);

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
    <div className="animate-slide-in flex flex-col h-full">
      {/* Avatar and Basic Info */}
      <div className="flex flex-col items-center text-center mb-2">
        <div
          className="w-16 h-16 lg:w-24 lg:h-24 rounded-full flex items-center justify-center text-3xl font-black mb-3 relative overflow-hidden shadow-2xl select-none bg-slate-200"
          style={{ backgroundColor: !user.profile_image ? bgColor : undefined, color: !user.profile_image ? textColor : undefined }}
        >
          {user.profile_image ? (
            <img
              src={user.profile_image}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : user.username === user.username ? ( // Simulation: always show for current user for now
             <img
              src={profilePic}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : user.current_rank?.badge_image ? (
            <img
              src={user.current_rank.badge_image}
              alt={user.current_rank.name}
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        <div className="flex flex-col items-center gap-1 mb-4">
          <h3 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight mb-2">
            @{user.username}
          </h3>

          <div className="flex items-center gap-2">
            
            <div className="bg-[#001c4d] px-4 py-2 rounded-xl shadow-md flex items-center gap-3 border border-white/10 flex-1">
              <Trophy className="h-5 w-5 text-amber-400" />
              <div className="flex flex-col leading-tight items-start">
                <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">
                  Puntos Santi
                </span>
                <span className="text-xl font-bold text-white tabular-nums">
                  {user.total_score}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/ranking")}
              className="bg-white px-4 py-2 rounded-xl shadow-md flex items-center gap-3 border border-slate-200 hover:border-[#001c4d]/20 hover:bg-slate-50 transition-all group/rank"
              title="Ver Ranking Global"
            >
              <Medal className="h-6 w-6 text-[#001c4d] group-hover/rank:scale-125 transition-transform duration-200" />

              <div className="flex flex-col leading-tight items-start">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  Ranking
                </span>

                <span className="text-xl font-bold text-[#001c4d] tabular-nums">
                  {rankingInfo ? `${rankingInfo.rank}/${rankingInfo.total}` : "-"}
                </span>
              </div>
            </button>

          </div>

          {user.current_rank && (
            <p className="text-[9px] font-black text-amber-600/80 uppercase tracking-[0.2em] mt-1">
              Rango: {user.current_rank.name}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-4">
        <button
          onClick={() => navigate("/shop")}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#001c4d] border border-[#001c4d] text-white shadow-lg group/sidebar hover:scale-[1.02] active:scale-95 transition-all duration-300"
        >
          <ShoppingBag className="h-5 w-5 text-amber-400 group-hover/sidebar:rotate-12 transition-transform" />
          <div className="flex flex-col items-start leading-none">
            <span className="text-sm font-black uppercase tracking-widest">Tienda de Santi</span>
          </div>
        </button>

        <div className="flex items-center justify-between px-5 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:border-[#001c4d]/20">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Exámenes Realizados</span>
          <span className="text-sm font-black text-[#001c4d] px-5 py-0.5 rounded-xl bg-slate-100 border border-slate-200">
            {completedCount} / {exams.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4 p-3 rounded-2xl bg-blue-50/50 border border-blue-200 shadow-sm group/progress">
        <div className="flex justify-between items-center mb-2 text-blue-900">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
            Tu Progreso
          </span>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-white border border-blue-200">
            {exams.length > 0 ? Math.round((completedCount / exams.length) * 100) : 0}%
          </span>
        </div>

        <div className="h-2 bg-white rounded-full overflow-hidden p-[1px] shadow-sm border border-blue-100">
          <div
            className="h-full bg-gradient-to-r from-[#001c4d] to-blue-600 rounded-full transition-all duration-1000 ease-out shadow-sm"
            style={{ width: `${exams.length > 0 ? (completedCount / exams.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="mt-4 w-full flex items-center justify-center gap-3 py-3 rounded-2xl border-2 border-red-400 bg-white text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500 transition-all duration-300 shadow-sm"
      >
        <LogOut className="h-4 w-4 text-red-500" />
        Cerrar sesión
      </button>
    </div>
  );
};

export default UserProfile;
