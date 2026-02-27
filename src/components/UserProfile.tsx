import { useAppContext } from "@/context/AppContext";
import { Trophy, LogOut } from "lucide-react";

const UserProfile = () => {
  const { user, logout, exams } = useAppContext();

  if (!user) return null;

  const completedCount = exams.filter((e) => e.status === "completed").length;

  return (
    <div className="bg-card rounded-xl border border-border p-6 animate-slide-in">
      {/* Avatar */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-3">
          {user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <h3 className="text-base font-semibold text-foreground">{user.fullName}</h3>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium text-foreground">Puntos totales</span>
          </div>
          <span className="text-lg font-bold text-warning">{user.totalPoints}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
          <span className="text-sm font-medium text-foreground">Exámenes completados</span>
          <span className="text-sm font-semibold text-foreground">
            {completedCount} / {exams.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Progreso general</span>
          <span>{Math.round((completedCount / exams.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / exams.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  );
};

export default UserProfile;
