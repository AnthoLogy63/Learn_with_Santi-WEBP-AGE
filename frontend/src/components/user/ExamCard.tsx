import { useNavigate } from "react-router-dom";
import { Exam } from "@/context/AppContext";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

interface ExamCardProps {
  exam: Exam;
}

const ExamCard = ({ exam }: ExamCardProps) => {
  const navigate = useNavigate();
  const isCompleted = exam.status === "completed";

  return (
    <div className="group bg-white/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex flex-col justify-between hover:bg-white/25 hover:border-white/20 transition-all duration-300 shadow-2xl animate-fade-in text-white">
      <div>
        <div className="flex items-start justify-between mb-5">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
            📝
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full ${isCompleted
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Completado
              </>
            ) : (
              <>
                <Circle className="h-3 w-3" />
                Pendiente
              </>
            )}
          </span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2 leading-tight">{exam.name}</h3>
        <p className="text-sm text-white/60 mb-5 line-clamp-2 leading-relaxed font-medium">
          {exam.description || "Sin descripción disponible para este examen."}
        </p>
      </div>

      <button
        onClick={() => navigate(`/exam/${exam.id}`)}
        className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-[#001c4d] font-bold text-sm hover:bg-accent hover:text-white transition-all duration-300 shadow-lg active:scale-95"
      >
        {isCompleted ? "Reintentar" : "Comenzar"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ExamCard;
