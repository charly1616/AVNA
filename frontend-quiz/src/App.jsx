import { useCallback, useEffect, useState } from "react";

import quizService from "@/api/quiz.service";
import ErrorScreen from "@/components/ErrorScreen";
import LandingScreen from "@/components/LandingScreen";
import LoadingScreen from "@/components/LoadingScreen";
import QuestionCard from "@/components/QuestionCard";
import ResultsScreen from "@/components/ResultsScreen";
import StartScreen from "@/components/StartScreen";
import { readActivityCode } from "@/utils/activityCode";
import { readStudent, saveStudent } from "@/utils/studentSession";

const errorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

export default function App() {
  const [slug, setSlug] = useState(readActivityCode);
  const [activity, setActivity] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(Boolean(readActivityCode()));

  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);

  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const total = activity?.totalQuestions ?? 0;
  const number = index + 1;
  const question = questions[index] ?? null;

  const loadActivity = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const loaded = await quizService.getActivity(slug);
      setActivity(loaded);
    } catch (error) {
      setActivity(null);
      setLoadError(
        errorMessage(error, "La actividad no existe o todavía no está disponible.")
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return undefined;

    let cancelled = false;

    quizService
      .getActivity(slug)
      .then((loaded) => {
        if (cancelled) return;
        setActivity(loaded);
        setLoadError("");
      })
      .catch((error) => {
        if (cancelled) return;
        setActivity(null);
        setLoadError(
          errorMessage(error, "La actividad no existe o todavía no está disponible.")
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /**
   * Every question is asked for by its number, so the quiz only needs the code
   * of the activity to be played.
   */
  const loadQuestion = useCallback(
    async (questionNumber) => {
      try {
        const payload = await quizService.getQuestion(slug, questionNumber);
        setQuestions((current) => {
          const next = [...current];
          next[questionNumber - 1] = payload.question;
          return next;
        });
        return payload.question;
      } catch (error) {
        setFormError(errorMessage(error, "No se pudo cargar la pregunta."));
        return null;
      }
    },
    [slug]
  );

  function handleOpen(code) {
    window.history.pushState({}, "", `/a/${encodeURIComponent(code)}`);
    setLoading(true);
    setSlug(code);
    setAttempt(null);
    setResult(null);
    setQuestions([]);
    setAnswers({});
    setIndex(0);
  }

  async function handleStart({ studentName, studentEmail }) {
    setBusy(true);
    setFormError("");

    try {
      /**
       * The student registers with their name only. The token that comes back
       * is kept in the browser, so the next quizzes are started with it.
       */
      const known = readStudent();
      const student =
        known && known.name.toLowerCase() === studentName.toLowerCase()
          ? known
          : await quizService.registerStudent(studentName);

      saveStudent(student);

      const started = await quizService.startAttempt(slug, {
        studentToken: student.token,
        studentEmail,
      });

      setAttempt(started);
      setAnswers({});
      setIndex(0);
      setResult(null);
      await loadQuestion(1);
    } catch (error) {
      setFormError(errorMessage(error, "No se pudo iniciar la actividad."));
    } finally {
      setBusy(false);
    }
  }

  function handleChange(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  async function saveCurrentAnswer() {
    if (!question) {
      setFormError("La pregunta todavía se está cargando.");
      return false;
    }

    const value = answers[question.id];

    if (!value) {
      setFormError("Responde la pregunta para continuar.");
      return false;
    }

    setFormError("");
    setBusy(true);

    try {
      await quizService.logAnswer(attempt.id, attempt.token, {
        type: question.type,
        questionNumber: question.number,
        value,
      });
      return true;
    } catch (error) {
      setFormError(errorMessage(error, "No se pudo guardar la respuesta."));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleNext() {
    const saved = await saveCurrentAnswer();
    if (!saved) return;

    const nextIndex = index + 1;
    setIndex(nextIndex);

    if (nextIndex < total) {
      await loadQuestion(nextIndex + 1);
    }
  }

  async function handleFinish() {
    const saved = await saveCurrentAnswer();
    if (!saved) return;

    setBusy(true);

    try {
      const submitted = await quizService.submitAttempt(attempt.id, attempt.token);
      setResult(submitted);
    } catch (error) {
      setFormError(errorMessage(error, "No se pudo enviar la solución."));
    } finally {
      setBusy(false);
    }
  }

  function handleRestart() {
    setAttempt(null);
    setResult(null);
    setQuestions([]);
    setAnswers({});
    setIndex(0);
    setFormError("");
  }

  if (!slug) {
    return <LandingScreen onOpen={handleOpen} />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (loadError) {
    return (
      <ErrorScreen
        message={loadError}
        onRetry={loadActivity}
        onBack={() => {
          window.history.pushState({}, "", "/");
          setSlug("");
          setLoadError("");
          setActivity(null);
        }}
      />
    );
  }

  if (!activity) {
    return <LoadingScreen />;
  }

  if (result) {
    return <ResultsScreen result={result} questions={questions} onRestart={handleRestart} />;
  }

  if (!attempt) {
    return (
      <StartScreen
        activity={activity}
        onStart={handleStart}
        busy={busy}
        error={formError}
        initialName={readStudent()?.name ?? ""}
      />
    );
  }

  if (!question) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ "--brand": activity.color }}>
      <div className="w-full max-w-xl">
        <div className="mb-6 h-3 overflow-hidden rounded-full bg-[var(--line)]">
          <div
            className="h-full rounded-full bg-[var(--brand)] transition-all"
            style={{ width: `${(number / total) * 100}%` }}
          />
        </div>

        {formError && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-[var(--red)]">
            {formError}
          </p>
        )}

        <QuestionCard
          key={question.id}
          question={question}
          index={index}
          total={total}
          value={answers[question.id]}
          onChange={(value) => handleChange(question.id, value)}
          onNext={handleNext}
          onFinish={handleFinish}
          busy={busy}
        />
      </div>
    </div>
  );
}
