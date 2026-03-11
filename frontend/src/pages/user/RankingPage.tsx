import { useEffect, useState } from "react";
import { userService, User } from "@/api/userService";
import { Trophy, Medal, Crown, ArrowLeft, Loader2, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import profilePic from "@/media/foto.jpg";

interface RankingData {
    top_users: User[];
    user_rank: number;
    total_users: number;
}

const RankingPage = () => {
    const { user: currentUser } = useAppContext();
    const navigate = useNavigate();
    const [data, setData] = useState<RankingData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const res = await userService.getRanking();
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Error fetching ranking:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRanking();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#001c4d] flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-white animate-spin opacity-20" />
            </div>
        );
    }

    const podium = data?.top_users.slice(0, 3) || [];
    const others = data?.top_users.slice(3) || [];
    const isUserInTop13 = data?.top_users.some(u => u.id === currentUser?.id);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col relative">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#001c4d] text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white/70 hover:text-white transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Volver al Dashboard</span>
                        <span className="sm:hidden">Volver</span>
                    </button>
                    <div className="flex items-center gap-1.5 sm:gap-2 justify-center flex-1">
                        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                        <h1 className="text-base sm:text-xl font-black uppercase tracking-widest truncate">Ranking Nacional</h1>
                    </div>
                    <div className="w-16 sm:w-24 hidden sm:block"></div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto w-full mt-5 px-4 py-8 sm:py-12 flex-1">
                {/* Podium Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
                    {/* Second Place */}
                    {podium[1] && (
                        <div className="flex flex-col items-center order-2 md:order-1 scale-90 md:scale-95 origin-bottom">
                            <div className="relative mb-4">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-200 border-4 border-slate-300 flex items-center justify-center shadow-xl overflow-hidden">
                                    {podium[1].profile_image ? (
                                        <img src={podium[1].profile_image} alt={podium[1].username} className="w-full h-full object-cover" />
                                    ) : (podium[1].id === currentUser?.id) ? (
                                        <img src={profilePic} alt={podium[1].username} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400" />
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-slate-400 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-base font-black border-2 border-white shadow-md">
                                    2
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-800 text-base sm:text-lg">@{podium[1].username}</p>
                                <div className="bg-slate-200 text-slate-600 px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-black mt-1">
                                    {podium[1].total_score} pts
                                </div>
                            </div>
                            <div className="h-16 sm:h-24 w-full bg-slate-300 rounded-t-2xl mt-4 shadow-inner flex items-center justify-center">
                                <Medal className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                            </div>
                        </div>
                    )}

                    {/* First Place */}
                    {podium[0] && (
                        <div className="flex flex-col items-center order-1 md:order-2 z-10">
                            <div className="relative mb-4">
                                <div className="absolute -top-7 sm:-top-9 inset-x-0 flex justify-center text-amber-500 animate-bounce">
                                    <Crown className="h-8 w-8 sm:h-10 sm:w-10 fill-amber-500" />
                                </div>
                                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center shadow-2xl overflow-hidden ring-4 ring-amber-400/20">
                                    {podium[0].profile_image ? (
                                        <img src={podium[0].profile_image} alt={podium[0].username} className="w-full h-full object-cover" />
                                    ) : (podium[0].id === currentUser?.id) ? (
                                        <img src={profilePic} alt={podium[0].username} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="h-14 w-14 sm:h-16 sm:w-16 text-amber-500" />
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-amber-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-sm sm:text-xl border-2 border-white shadow-md">
                                    1
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="font-black text-[#001c4d] text-lg sm:text-xl">@{podium[0].username}</p>
                                <div className="bg-amber-400 text-[#001c4d] px-3 sm:px-4 py-1.5 rounded-full text-sm font-black mt-1 shadow-lg shadow-amber-200">
                                    {podium[0].total_score} pts
                                </div>
                            </div>
                            <div className="h-24 sm:h-32 w-full bg-[#001c4d] rounded-t-2xl mt-4 shadow-2xl flex items-center justify-center">
                                <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-amber-400" />
                            </div>
                        </div>
                    )}

                    {/* Third Place */}
                    {podium[2] && (
                        <div className="flex flex-col items-center order-3 md:order-3 scale-90 md:scale-95 origin-bottom">
                            <div className="relative mb-4">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-orange-100 border-4 border-orange-300 flex items-center justify-center shadow-xl overflow-hidden">
                                    {podium[2].profile_image ? (
                                        <img src={podium[2].profile_image} alt={podium[2].username} className="w-full h-full object-cover" />
                                    ) : (podium[2].id === currentUser?.id) ? (
                                        <img src={profilePic} alt={podium[2].username} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="h-10 w-10 sm:h-12 sm:w-12 text-orange-400" />
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-orange-600 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-base font-black border-2 border-white shadow-md">
                                    3
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-800 text-base sm:text-lg">@{podium[2].username}</p>
                                <div className="bg-orange-100 text-orange-700 px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-black mt-1">
                                    {podium[2].total_score} pts
                                </div>
                            </div>
                            <div className="h-14 sm:h-20 w-full bg-orange-200 rounded-t-2xl mt-4 shadow-inner flex items-center justify-center">
                                <Medal className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400" />
                            </div>
                        </div>
                    )}
                </div>

                {/* List Section */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Posición y Usuario</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Puntaje</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {others.map((u, idx) => (
                            <div
                                key={u.id}
                                className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 transition-colors ${u.id === currentUser?.id ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                    <span className="w-6 text-xs sm:text-sm font-black text-slate-400 flex-shrink-0">#{idx + 4}</span>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {u.profile_image ? (
                                            <img src={u.profile_image} alt={u.username} className="w-full h-full object-cover" />
                                        ) : (u.id === currentUser?.id) ? (
                                            <img src={profilePic} alt={u.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                                        )}
                                    </div>
                                    <span className={`font-bold text-xs sm:text-sm ${u.id === currentUser?.id ? 'text-[#001c4d]' : 'text-slate-700'}`}>
                                        @{u.username}
                                        {u.id === currentUser?.id && <span className="ml-1 sm:ml-2 text-[8px] sm:text-[10px] uppercase bg-amber-400 px-1 sm:px-1.5 py-0.5 rounded text-[#001c4d]">Tú</span>}
                                    </span>
                                </div>
                                <span className={`text-xs sm:text-sm font-black flex-shrink-0 ${u.id === currentUser?.id ? 'text-[#001c4d]' : 'text-slate-900'}`}>{u.total_score} pts</span>
                            </div>
                        ))}

                        {/* Special row for user if not in top 13 */}
                        {!isUserInTop13 && currentUser && data && (
                            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 bg-blue-50 border-t-2 border-blue-200 mt-2">
                                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                    <span className="w-6 text-xs sm:text-sm font-black text-blue-600 flex-shrink-0">#{data.user_rank}</span>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
                                        {currentUser.profile_image ? (
                                            <img src={currentUser.profile_image} alt={currentUser.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={profilePic} alt={currentUser.username} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="font-black text-xs sm:text-sm text-[#001c4d]">@{currentUser.username}</span>
                                        <span className="text-[8px] sm:text-[10px] uppercase font-bold text-blue-400 truncate">Tu posición actual</span>
                                    </div>
                                </div>
                                <span className="text-base sm:text-lg font-black text-[#001c4d] flex-shrink-0">{currentUser.total_score} pts</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                        Compitiendo con otros <span className="font-bold text-slate-600">{data?.total_users} jugadores</span>.
                        ¡Sigue estudiando para subir de nivel!
                    </p>
                </div>
            </main>
        </div>
    );
};

export default RankingPage;
