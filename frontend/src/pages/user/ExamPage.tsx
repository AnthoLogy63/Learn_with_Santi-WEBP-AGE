import FondoCaja from "@/media/FondoCaja.webp";
import SantiGif from "@/media/santi.gif";
import SantiWebp from "@/media/santi.webp";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { examService } from "@/api/examService";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Loader2, Play, X, Maximize2, Clock } from "lucide-react";

interface Option {
  id: number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  text: string;
  image: string | null;
  options: Option[];
  points: number;
  time_limit_seconds: number;
  question_type: 'single_choice' | 'multiple_choice' | 'open_ended';
}

const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;

  const baseUrl = import.meta.env.VITE_API_URL;
  const cleanBaseUrl = baseUrl.endsWith("/api") ? baseUrl.slice(0, -4) : baseUrl;

  if (imagePath.startsWith("/media/")) {
    return `${cleanBaseUrl}${imagePath}`;
  }
  return `${cleanBaseUrl}/media/${imagePath}`;
};

const ExamPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, fetchUserScore, fetchExams } = useAppContext();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Quiz Mode States
  const [feedbackStatus, setFeedbackStatus] = useState<'answering' | 'checked'>('answering');
  const [streakCorrect, setStreakCorrect] = useState(0);
  const [streakWrong, setStreakWrong] = useState(0);
  const [activeMeme, setActiveMeme] = useState<{ type: 'happy' | 'sad'; count: number } | null>(null);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [imageLayout, setImageLayout] = useState<'stack' | 'side'>('stack');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isTimeOut, setIsTimeOut] = useState(false);

  // Derive current question data
  const currentQuestion = questions[currentIndex];
  const isOpinionQuest = currentQuestion && (currentQuestion.question_type === 'single_choice' || currentQuestion.question_type === 'multiple_choice') &&
    !currentQuestion.options.some(o => o.is_correct);

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

  // Navigation Guard: Prevent accidental reload/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!showResults && questions.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [showResults, questions.length]);

  // Timer Logic
  useEffect(() => {
    if (showResults || !currentQuestion || feedbackStatus !== 'answering' || isAutoAdvancing || activeMeme) return;

    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResults, currentQuestion, feedbackStatus, isAutoAdvancing, activeMeme]);

  // Reset timer on question change
  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(currentQuestion.time_limit_seconds || 60);
      setIsTimeOut(false);
    }
  }, [currentIndex, currentQuestion]);

  const handleTimeOut = () => {
    if (isAutoAdvancing || feedbackStatus === 'checked') return;
    setIsTimeOut(true);
    // When time is out, we force a "Check" with whatever is selected (could be nothing)
    handleContinue(true);
  };

  const handleExit = () => {
    if (showResults) {
      navigate("/dashboard");
    } else if (window.confirm("¿Estás seguro de que deseas salir? Tu progreso en este intento no se guardará.")) {
      navigate("/dashboard");
    }
  };

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

  const handleContinue = (fromTimeOut = false) => {
    if (isAutoAdvancing) return;

    const selected = answers[currentQuestion.id];

    const hasValue = currentQuestion.question_type === 'multiple_choice'
      ? (selected || []).length > 0
      : (selected !== undefined && selected !== "");

    if (!hasValue && !fromTimeOut) {
      alert("No puedes pasar a la siguiente pregunta sin antes haber seleccionado alguna opción.");
      return;
    }

    setIsAutoAdvancing(true);

    // Calculate correctness
    let isCorrect = false;
    const isOpinionQuest = (currentQuestion.question_type === 'single_choice' || currentQuestion.question_type === 'multiple_choice') &&
      !currentQuestion.options.some(o => o.is_correct);

    if (fromTimeOut && !hasValue) {
      isCorrect = false;
    } else if (isOpinionQuest) {
      isCorrect = true;
    } else if (currentQuestion.question_type === 'single_choice') {
      isCorrect = currentQuestion.options.find(o => o.id === selected)?.is_correct || false;
    } else if (currentQuestion.question_type === 'multiple_choice') {
      const selectedIds = selected as number[];
      const correctIds = currentQuestion.options.filter(o => o.is_correct).map(o => o.id);
      isCorrect = selectedIds.length === correctIds.length && selectedIds.every(id => correctIds.includes(id));
    } else if (currentQuestion.question_type === 'open_ended') {
      isCorrect = (selected as string || "").trim().length > 0;
    }

    // Update streaks
    let memeToSet: any = null;
    if (isCorrect) {
      const nextCorrect = streakCorrect + 1;
      setStreakCorrect(nextCorrect);
      setStreakWrong(0);
      if (nextCorrect > 0 && nextCorrect % 3 === 0) {
        memeToSet = { type: 'happy', count: nextCorrect };
      }
    } else {
      const nextWrong = streakWrong + 1;
      setStreakWrong(nextWrong);
      setStreakCorrect(0);
      if (nextWrong > 0 && nextWrong % 2 === 0) {
        memeToSet = { type: 'sad', count: nextWrong };
      }
    }

    setFeedbackStatus('checked');

    // Auto-advance after 2 seconds
    setTimeout(() => {
      // Don't show meme cards if time ran out (punishment is skipping)
      if (memeToSet && !fromTimeOut) {
        setActiveMeme(memeToSet);
      }

      if (currentIndex < questions.length - 1) {
        setFeedbackStatus('answering');
        setCurrentIndex(currentIndex + 1);
        setIsAutoAdvancing(false);
      } else {
        handleFinish();
      }
    }, 2000);
  };

  const handleAnswer = (val: any) => {
    if (feedbackStatus === 'checked' || isAutoAdvancing) return;
    if (currentQuestion.question_type === 'multiple_choice') {
      const current = (answers[currentQuestion.id] || []) as number[];
      if (current.includes(val)) {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: current.filter(id => id !== val) }));
      } else {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: [...current, val] }));
      }
    } else {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }));
    }
  };

  const handleFinish = async () => {
    if (!attemptId) return;
    setIsSubmitting(true);

    const formattedAnswers = Object.entries(answers).map(([qId, val]) => {
      const qNum = parseInt(qId);
      const question = questions.find(q => q.id === qNum);

      const payload: any = { question_id: qNum };
      if (question?.question_type === 'multiple_choice') {
        payload.selected_option_ids = val;
      } else if (question?.question_type === 'open_ended') {
        payload.text_response = val;
      } else {
        payload.selected_option_id = val;
      }
      return payload;
    });

    try {
      const response = await examService.submitAnswers(attemptId, formattedAnswers);

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setShowResults(true);
        fetchUserScore();
        fetchExams(); // Refresh exam status in dashboard
      } else {
        alert("Error al finalizar la evaluación. Por favor intente de nuevo.");
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
      alert("Error de conexión al finalizar la evaluación.");
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
          <h2 className="text-3xl font-black text-white mb-2">¡Evaluación Finalizada!</h2>
          <p className="text-white/60 mb-8 font-medium">
            {results?.counts_for_score
              ? "Este intento sumó puntos a tu perfil."
              : "Límite de intentos puntuables alcanzado. Este intento es informativo."}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-2xl font-black text-amber-400">{results?.score}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-white/40 mt-1">Puntaje</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-2xl font-black text-white">
                {results?.correct_count} / {results?.total_questions}
              </p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-white/40 mt-1">Correctas</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Tu puntaje total:</span>
              <span className="text-lg font-black text-white">{results?.total_user_score} pts</span>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-xl border ${results?.attempts_left > 0 ? "bg-amber-400/10 border-amber-400/20" : "bg-white/5 border-white/10"}`}>
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Intentos puntuables restantes:</span>
              <span className={`text-lg font-black ${results?.attempts_left > 0 ? "text-amber-400" : "text-white/40"}`}>
                {results?.attempts_left}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={handleExit} className="flex-1 py-4 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-colors">
              Cerrar
            </button>
            <button onClick={() => window.location.reload()} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-[#001c4d] text-sm font-bold hover:bg-white/90 transition-all shadow-lg active:scale-95">
              <RotateCcw className="h-4 w-4" />
              Nuevo intento
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeMeme) {
    return (
      <div className="h-screen w-screen bg-[#001c4d] flex items-center justify-center p-4 fixed inset-0 z-[100] overflow-hidden"
        style={{ backgroundImage: `url(${FondoCaja})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
        <div className="relative z-10 max-w-sm w-full flex flex-col items-center max-h-[95vh]">
          <div className={`inline-block px-6 py-2 rounded-full mb-6 font-black uppercase tracking-[0.3em] text-xs ${activeMeme.type === 'happy' ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-r from-indigo-500 to-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)]'}`}>
            {activeMeme.type === 'happy' ? '¡Tarjeta Feliz!' : '¡Tarjeta Triste!'}
          </div>

          <div className="relative mb-8 w-full flex justify-center">
            <img src={SantiGif} alt="Santi" className={`max-w-[260px] w-full h-auto rounded-3xl border-2 transition-all duration-500 ${activeMeme.type === 'happy' ? 'shadow-[0_0_50px_rgba(16,185,129,0.4)] border-emerald-400/30' : 'shadow-[0_0_50px_rgba(225,29,72,0.4)] border-rose-400/30'}`} />
            <div className={`absolute -bottom-4 px-6 py-2 rounded-xl shadow-2xl scale-90 transition-colors duration-500 ${activeMeme.type === 'happy' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60">RACHA</p>
              <p className="text-2xl font-black">x{activeMeme.count}</p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-8 px-4 text-center leading-relaxed">
            {activeMeme.type === 'happy'
              ? '¡Santi está muy orgulloso de ti! Vas por buen camino.'
              : 'Santi sabe que puedes hacerlo mejor. ¡No te rindas!'}
          </h3>

          <button
            onClick={() => setActiveMeme(null)}
            className="w-full bg-[#09B3B3] text-white py-4 rounded-2xl font-black text-base shadow-xl hover:bg-[#079191] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play className="h-5 w-5 fill-current" />
            CONTINUAR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001c4d] text-white flex flex-col relative overflow-hidden"
      style={{ backgroundImage: `url(${FondoCaja})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl relative z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 grid grid-cols-3 items-center">
          {/* Left: Salir */}
          <div className="flex justify-start">
            <button onClick={handleExit} className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Salir
            </button>
          </div>

          {/* Center: Streaks */}
          <div className="flex justify-center">
            <div className="flex gap-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
              <span className="text-sm font-black uppercase tracking-widest text-emerald-400">+{streakCorrect}</span>
              <span className="text-sm font-black uppercase tracking-widest text-red-500">-{streakWrong}</span>
            </div>
          </div>

          {/* Right: Timer and Counter */}
          <div className="flex justify-end items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-500 
              ${isTimeOut
                ? 'bg-red-500 text-white border-red-400 scale-150 shadow-[0_0_30px_rgba(239,68,68,0.6)] z-50 animate-bounce'
                : timeLeft <= 10
                  ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'bg-white/5 border-white/10 text-white/60'
              } ${!isTimeOut && timeLeft <= 5 ? 'scale-110 animate-pulse' : ''}`}>
              <Clock className={`h-3.5 w-3.5 ${timeLeft <= 10 && !isTimeOut ? 'animate-spin-slow' : ''}`} />
              <span className="text-xs font-black tracking-widest tabular-nums">
                {isTimeOut ? "0:00" : `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
              </span>
            </div>
            <span className="hidden sm:inline-flex text-[10px] font-black text-white/30 uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full border border-white/5">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full px-6 pt-6 relative z-10">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-6 py-12 flex-1 relative z-10">
        <div className="animate-fade-in" key={currentQuestion.id}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <span className="inline-block text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-2">
                Pregunta {currentIndex + 1}
              </span>
              <h2 className="text-2xl lg:text-3xl font-bold text-white leading-snug">
                {currentQuestion.text}
              </h2>
            </div>
            <div className="flex flex-col items-end gap-2">
              {currentQuestion.question_type === 'multiple_choice' && (
                <span className="flex-shrink-0 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                  Selección Múltiple
                </span>
              )}
            </div>
          </div>

          <div className={`${currentQuestion.image ? (imageLayout === 'side' ? 'flex flex-col md:flex-row gap-8 items-start' : 'flex flex-col gap-6') : ''}`}>
            {currentQuestion.image && (
              <div className={`relative group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-black/20 self-center md:self-start ${imageLayout === 'side' ? 'w-full md:w-1/2 lg:w-[45%]' : 'w-full max-w-2xl mx-auto'
                }`}>
                <img
                  src={getImageUrl(currentQuestion.image) || ""}
                  alt="Pregunta"
                  className="w-full h-auto object-contain max-h-[400px] md:max-h-[500px] transition-transform duration-500 group-hover:scale-105"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth > img.naturalHeight * 1.5) {
                      setImageLayout('stack');
                    } else {
                      setImageLayout('side');
                    }
                  }}
                  onClick={() => setFullScreenImage(getImageUrl(currentQuestion.image))}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullScreenImage(getImageUrl(currentQuestion.image));
                  }}
                  className="absolute bottom-4 right-4 p-3 rounded-full bg-black/60 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:flex items-center justify-center hidden"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                {/* Indicador para móviles */}
                <div className="absolute bottom-2 right-2 md:hidden bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                  <Maximize2 className="h-3 w-3 text-white/80" />
                  <span className="text-[8px] font-black text-white/80 uppercase">Tocar para ampliar</span>
                </div>
              </div>
            )}

            <div className={`${currentQuestion.image && imageLayout === 'side' ? 'flex-1 w-full' : 'w-full'}`}>
              {currentQuestion.question_type === 'open_ended' ? (
                <textarea
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  disabled={feedbackStatus === 'checked' || isAutoAdvancing}
                  placeholder="Escribe tu respuesta aquí..."
                  className={`w-full h-40 p-6 rounded-2xl bg-white/5 border text-white focus:border-amber-400 focus:outline-none transition-all placeholder:text-white/20 font-medium ${feedbackStatus === 'checked' ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-white/10'
                    }`}
                />
              ) : (
                <div className={`grid gap-4 w-full ${imageLayout === 'side' ? 'grid-cols-1 lg:grid-cols-1' : 'sm:grid-cols-1 md:grid-cols-2'}`}>
                  {currentQuestion.options.map((option, index) => {
                    const letter = String.fromCharCode(65 + index);
                    const isSelected = currentQuestion.question_type === 'multiple_choice'
                      ? (answers[currentQuestion.id] || []).includes(option.id)
                      : answers[currentQuestion.id] === option.id;

                    const isMultiple = currentQuestion.question_type === 'multiple_choice';

                    let containerStyle = "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20";
                    if (feedbackStatus === 'checked') {
                      const isCorrectView = option.is_correct || (isOpinionQuest && isSelected);
                      const isWrongView = isSelected && !option.is_correct && !isOpinionQuest;

                      if (isCorrectView) {
                        containerStyle = "border-emerald-500 bg-emerald-500/20 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]";
                      } else if (isWrongView) {
                        containerStyle = "border-red-500 bg-red-500/20 text-white shadow-[0_0_20px_rgba(239,68,68,0.1)]";
                      } else {
                        containerStyle = "border-white/5 bg-white/5 text-white/20 opacity-40";
                      }
                    } else if (isSelected) {
                      containerStyle = "border-amber-400 bg-amber-400/20 text-white shadow-lg ring-1 ring-amber-400/50";
                    }

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer(option.id)}
                        disabled={feedbackStatus === 'checked'}
                        className={`group w-full text-left p-6 rounded-2xl border transition-all duration-300 ${containerStyle} ${feedbackStatus === 'checked' ? 'cursor-default' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center text-sm font-black transition-all duration-300 ${isMultiple ? "rounded-lg" : "rounded-full"
                            } ${isSelected
                              ? (feedbackStatus === 'checked' && !option.is_correct && !isOpinionQuest ? "bg-red-500 text-white" : "bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)]")
                              : (feedbackStatus === 'checked' && (option.is_correct || (isOpinionQuest && isSelected)) ? "bg-emerald-500 text-white" : "bg-white/10 text-white border border-white/10")
                            }`}>
                            {isMultiple ? (isSelected || (feedbackStatus === 'checked' && (option.is_correct || (isOpinionQuest && isSelected))) ? "✓" : "") : letter}
                          </div>
                          <span className="text-base font-bold leading-tight group-hover:text-white transition-colors">
                            {option.text}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mt-12 border-t border-white/10 pt-8">
          <button
            onClick={() => handleContinue()}
            disabled={isAutoAdvancing}
            className={`w-full max-w-sm py-4 rounded-xl text-lg font-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${isAutoAdvancing
              ? 'bg-white/10 text-white/40 cursor-wait'
              : (feedbackStatus === 'answering' ? 'bg-white text-[#001c4d] hover:bg-white/90' : 'bg-[#09B3B3] text-white')
              }`}
          >
            {isAutoAdvancing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                {currentIndex < questions.length - 1 ? 'Continuar' : 'Finalizar y ver resultados'}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lightbox / Modal para imagen */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setFullScreenImage(null)}
        >
          <button
            onClick={() => setFullScreenImage(null)}
            className="absolute top-6 right-6 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-30"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={fullScreenImage}
              alt="Imagen ampliada"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-bold uppercase tracking-widest hidden md:block">
            Presiona fuera para cerrar
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
