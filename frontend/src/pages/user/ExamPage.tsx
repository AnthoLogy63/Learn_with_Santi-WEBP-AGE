import FondoCaja from "@/media/FondoCaja.webp";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { examService } from "@/api/examService";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Loader2 } from "lucide-react";

interface Question {
  id: number;
  text: string;
  image: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  points: number;
  time_limit_seconds: number;
}

const ExamPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, fetchUserScore } = useAppContext();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }

    const fetchQuestions = async () => {
      if (!examId) return;
      try {
        const response = await examService.getQuestions(examId);
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.questions);
          setAttemptId(data.attempt_id);
        } else {
          console.error("Failed to fetch questions");
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [examId, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#001c4d] text-white">
        <Loader2 className="h-10 w-10 animate-spin text-white mb-4" />
        <p className="text-white/60 font-medium animate-pulse">Cargando evaluación...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001c4d] text-white">
        <p className="text-white/60 text-lg">No se encontraron preguntas para este examen.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (optionKey: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionKey }));
  };

  const handleFinish = async () => {
    if (!attemptId) return;
    setIsSubmitting(true);

    const formattedAnswers = Object.entries(answers).map(([qId, option]) => ({
      question_id: parseInt(qId),
      selected_option: option
    }));

    try {
      const response = await examService.submitAnswers(attemptId, formattedAnswers);

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setShowResults(true);
        fetchUserScore(); // Update points in context
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-[#001c4d] flex items-center justify-center px-4 overflow-hidden relative"
        style={{ backgroundImage: `url(${FondoCaja})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 text-center animate-fade-in relative shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">¡Intento finalizado!</h2>
          <p className="text-white/60 mb-8 font-medium">
            {results?.counts_for_score ? "Este intento sumó puntos a tu perfil." : "Límite de intentos puntuables alcanzado."}
          </p>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
              <p className="text-3xl font-black text-amber-400">{results?.score}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-white/40 mt-1">Puntaje obtenido</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
              <p className="text-3xl font-black text-white">{results?.total_user_score}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-white/40 mt-1">Tu puntaje total</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 py-4 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-colors"
            >
              Volver al dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-[#001c4d] text-sm font-bold hover:bg-white/90 transition-all shadow-lg active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              Nuevo intento
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="min-h-screen bg-[#001c4d] text-white flex flex-col relative overflow-hidden"
      style={{ backgroundImage: `url(${FondoCaja})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl relative z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Salir
          </button>
          <span className="text-sm font-black uppercase tracking-widest">Evaluación en curso</span>
          <span className="text-xs font-bold text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-4xl mx-auto w-full px-6 pt-6 relative z-10">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto w-full px-6 py-12 flex-1 relative z-10">
        <div className="animate-fade-in" key={currentQuestion.id}>
          <span className="inline-block text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-4">
            Pregunta {currentIndex + 1}
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-10 leading-snug">
            {currentQuestion.text}
          </h2>

          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {['a', 'b', 'c', 'd'].map((key) => {
              const optionText = (currentQuestion as any)[`option_${key}`];
              const isSelected = answers[currentQuestion.id] === key;
              return (
                <button
                  key={key}
                  onClick={() => handleAnswer(key)}
                  className={`group w-full text-left p-6 rounded-2xl border transition-all duration-300 ${isSelected
                    ? "border-amber-400 bg-amber-400/20 text-white shadow-lg ring-1 ring-amber-400/50"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-black transition-colors ${isSelected ? "bg-amber-400 text-black" : "bg-white/10 text-white"
                      }`}>
                      {key.toUpperCase()}
                    </span>
                    <span className="text-base font-bold leading-tight group-hover:text-white transition-colors">{optionText}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-16 border-t border-white/10 pt-8">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-[#001c4d] text-sm font-black hover:bg-white/90 transition-all shadow-lg active:scale-95"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!allAnswered || isSubmitting}
              className="px-10 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-black hover:opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Finalizar evaluación
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
