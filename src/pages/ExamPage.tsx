import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { examQuestions, Question } from "@/data/examData";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

const ExamPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, exams, completeExam } = useAppContext();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  if (!examId || !examQuestions[examId]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Examen no encontrado.</p>
      </div>
    );
  }

  const exam = exams.find((e) => e.id === examId);
  const questions: Question[] = examQuestions[examId];
  const currentQuestion = questions[currentIndex];

  const handleAnswer = (optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
  };

  const handleFinish = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    completeExam(examId, {
      score,
      totalQuestions: questions.length,
      correctAnswers: correct,
      incorrectAnswers: questions.length - correct,
      completedAt: new Date().toISOString(),
    });
    setShowResults(true);
  };

  const correctCount = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
  const incorrectCount = questions.length - correctCount;
  const score = Math.round((correctCount / questions.length) * 100);

  if (showResults) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-card rounded-xl border border-border p-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">¡Examen finalizado!</h2>
          <p className="text-sm text-muted-foreground mb-6">{exam?.title}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-2xl font-bold text-warning">{score}</p>
              <p className="text-xs text-muted-foreground mt-1">Puntaje</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-2xl font-bold text-success">{correctCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Correctas</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-2xl font-bold text-destructive">{incorrectCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Incorrectas</p>
            </div>
          </div>

          {/* Review answers */}
          <div className="text-left space-y-3 mb-6 max-h-64 overflow-y-auto">
            {questions.map((q) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div key={q.id} className={`p-3 rounded-lg border text-sm ${isCorrect ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                  <div className="flex items-start gap-2">
                    {isCorrect ? <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-foreground font-medium">{q.text}</p>
                      <p className="text-muted-foreground mt-1">
                        Tu respuesta: {q.options[userAnswer] ?? "Sin responder"} 
                        {!isCorrect && <> · Correcta: {q.options[q.correctAnswer]}</>}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
            >
              Volver al dashboard
            </button>
            <button
              onClick={() => { setShowResults(false); setAnswers({}); setCurrentIndex(0); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <RotateCcw className="h-4 w-4" />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
          <span className="text-sm font-medium text-foreground">{exam?.title}</span>
          <span className="text-xs text-muted-foreground">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-fade-in" key={currentQuestion.id}>
          <span className="inline-block text-xs font-semibold text-accent mb-2 uppercase tracking-wider">
            {currentQuestion.section}
          </span>
          <h2 className="text-lg font-semibold text-foreground mb-6">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full text-left p-4 rounded-lg border text-sm transition-all ${
                    isSelected
                      ? "border-accent bg-accent/5 text-foreground font-medium"
                      : "border-border bg-card text-foreground hover:border-accent/50"
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold mr-3 ${
                    isSelected ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!allAnswered}
              className="px-6 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Finalizar examen
            </button>
          )}
        </div>

        {/* Question dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-accent scale-125"
                  : answers[q.id] !== undefined
                  ? "bg-accent/40"
                  : "bg-secondary"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
