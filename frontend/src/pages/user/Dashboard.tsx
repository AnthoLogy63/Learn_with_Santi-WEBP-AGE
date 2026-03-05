import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import ExamCard from "@/components/user/ExamCard";

const Dashboard = () => {
  const { exams } = useAppContext();

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10 lg:py-12">
      <header className="mb-10 lg:mb-12">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3 drop-shadow-lg">
          Exámenes disponibles
        </h1>
        <p className="text-lg lg:text-xl text-white/80 max-w-2xl leading-relaxed">
          Supera tus retos académicos aquí. Selecciona una evaluación para poner a prueba tus conocimientos.
        </p>
      </header>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-12">
        {exams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </div>

      {exams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center mb-6 text-4xl shadow-inner">
            📭
          </div>
          <p className="text-white/60 text-lg font-medium">No hay exámenes activos en este momento.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
