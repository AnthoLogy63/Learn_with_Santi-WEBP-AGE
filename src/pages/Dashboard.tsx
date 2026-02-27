import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import UserProfile from "@/components/UserProfile";
import ExamCard from "@/components/ExamCard";

const Dashboard = () => {
  const { isAuthenticated, exams } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              MB
            </div>
            <span className="text-sm font-semibold text-foreground">Mi Bonito</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 lg:shrink-0">
            <UserProfile />
          </aside>

          {/* Main */}
          <main className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-1">Exámenes disponibles</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Selecciona un examen para comenzar tu evaluación.
            </p>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
