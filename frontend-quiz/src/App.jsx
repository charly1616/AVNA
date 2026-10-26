import { useCallback, useEffect, useState } from "react";

import quizService from "@/api/quiz.service";
import AppShell from "@/components/AppShell";
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
  const [checks, setChecks] = useState({});
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
        setAnswers((current) => {
          const loaded = payload.question;
          if (loaded.type === "sort" && !current[loaded.id]) {
            return {
              ...current,
              [loaded.id]: { order: loaded.items.map((item) => item.id) },
            };
          }
          return current;
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
    setChecks({});
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
      setChecks({});
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
    setChecks((current) => {
      if (!current[questionId]) return current;
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  }

  /**
   * Concept answers are free text, so they are checked by the answer
   * verification service. The verdicts are only informative: saving the
   * attempt never waits for them and never fails because of them.
   */
  async function checkConceptAnswers(question, value) {
    const cards = (value?.cards ?? []).filter((card) => card.text?.trim());
    if (cards.length === 0) return;

    const verdicts = await Promise.allSettled(
      cards.map((card) =>
        quizService.checkAnswer(slug, {
          questionId: question.id,
          cardId: card.cardId,
          answer: card.text.trim(),
        })
      )
    );

    const byCard = {};
    verdicts.forEach((verdict) => {
      if (verdict.status === "fulfilled" && verdict.value) {
        byCard[verdict.value.cardId] = verdict.value;
      }
    });

    if (Object.keys(byCard).length === 0) return;

    setChecks((current) => ({
      ...current,
      [question.id]: { ...(current[question.id] ?? {}), ...byCard },
    }));
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

      if (question.type === "concepts") {
        void checkConceptAnswers(question, value);
      }

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
    setChecks({});
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
    return (
      <ResultsScreen
        result={result}
        questions={questions}
        activity={activity}
        onRestart={handleRestart}
      />
    );
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
    <AppShell current={number} total={total} activity={activity}>
      <div className="card-wrapper">
        {formError && <p className="form-alert">{formError}</p>}

        <QuestionCard
          key={question.id}
          question={question}
          index={index}
          total={total}
          value={answers[question.id]}
          onChange={(value) => handleChange(question.id, value)}
          checks={checks[question.id] ?? null}
          onNext={handleNext}
          onFinish={handleFinish}
          busy={busy}
        />
      </div>
    </AppShell>
  );
}
