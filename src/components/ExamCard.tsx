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
    <div className="bg-card rounded-xl border border-border p-6 flex flex-col justify-between hover:shadow-md transition-shadow animate-fade-in">
      <div>
        <div className="flex items-start justify-between mb-4">
          <span className="text-3xl">{exam.icon}</span>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
              isCompleted
                ? "bg-teal/10 text-teal"
                : "bg-success/10 text-success"
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
                Por completar
              </>
            )}
          </span>
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">{exam.title}</h3>
        {exam.result && (
          <p className="text-sm text-muted-foreground">
            Último puntaje: <span className="font-semibold text-warning">{exam.result.score} pts</span>
          </p>
        )}
      </div>

      <button
        onClick={() => navigate(`/exam/${exam.id}`)}
        className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        {isCompleted ? "Reintentar" : "Comenzar"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ExamCard;
