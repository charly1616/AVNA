import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ActivityEditModal from "../components/manage/ActivityEditModal.jsx";
import ManageIcon from "../components/manage/ManageIcon.jsx";
import PageDecorations from "../components/layout/PageDecorations.jsx";
import TeacherHeader from "../components/layout/TeacherHeader.jsx";
import activityService from "../api/activity.service.js";

const answerLabel = (index) => {
  let value = index + 1;
  let label = "";
  while (value > 0) {
    value -= 1;
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }
  return label;
};
const questionTypeLabels = {
  abc: "Selección ABCD",
  sort: "Ordenar elementos",
  lines: "Unir con líneas",
  concepts: "Tarjetas sorpresa",
};

const questionsStorageKey = (activityId) => `teacher-portal:activity-questions:${activityId}`;
const createLocalId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const newConceptCard = () => ({
  id: createLocalId(),
  title: "",
  question: "",
  expectedAnswer: "",
  media: [],
  questionMedia: [],
  expectedAnswerMedia: [],
});

const normalizeQuestion = (question) => {
  if (!question) return question;
  const normalized = question.type ? { ...question } : { ...question, type: "abc" };

  if (typeof normalized.title !== "string" && typeof normalized.prompt === "string") {
    normalized.title = normalized.prompt;
    delete normalized.prompt;
  }
  normalized.media = Array.isArray(normalized.media) ? normalized.media : [];

  if (normalized.type === "abc" && Array.isArray(normalized.options)) {
    normalized.optionMedia = Array.isArray(normalized.optionMedia)
      ? normalized.optionMedia
      : normalized.options.map(() => []);
  }
  if (normalized.type === "sort" && Array.isArray(normalized.items)) {
    normalized.itemMedia = Array.isArray(normalized.itemMedia)
      ? normalized.itemMedia
      : normalized.items.map(() => []);
  }
  if (normalized.type === "lines" && Array.isArray(normalized.pairs)) {
    normalized.pairMedia = Array.isArray(normalized.pairMedia)
      ? normalized.pairMedia
      : normalized.pairs.map(() => ({ left: [], right: [] }));
  }
  if (normalized.type === "concepts" && Array.isArray(normalized.concepts)) {
    normalized.concepts = normalized.concepts.map((concept) => ({
      ...concept,
      id: concept.id || createLocalId(),
      media: Array.isArray(concept.media) ? concept.media : [],
      questionMedia: Array.isArray(concept.questionMedia) ? concept.questionMedia : [],
      expectedAnswerMedia: Array.isArray(concept.expectedAnswerMedia) ? concept.expectedAnswerMedia : [],
    }));
  }

  return normalized;
};

const readStoredQuestions = (activityId) => {
  try {
    const stored = window.localStorage.getItem(questionsStorageKey(activityId));
    const questions = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(questions)) return [];

    return questions
      .map(normalizeQuestion)
      .filter((question) => {
        if (!question || typeof question.id !== "string" || typeof question.title !== "string") return false;
        if (question.type === "abc") {
          return Array.isArray(question.options) && question.options.length >= 2 &&
            question.options.every((option) => typeof option === "string") &&
            Number.isInteger(question.correctOption) && question.correctOption >= 0 && question.correctOption < question.options.length;
        }
        if (question.type === "sort") {
          return Array.isArray(question.items) && question.items.length >= 2 &&
            question.items.every((item) => typeof item === "string");
        }
        if (question.type === "lines") {
          return Array.isArray(question.pairs) && question.pairs.length >= 2 &&
            question.pairs.every((pair) => pair && typeof pair.left === "string" && typeof pair.right === "string");
        }
        if (question.type === "concepts") {
          return Array.isArray(question.concepts) && question.concepts.length >= 1 && question.concepts.length <= 3 &&
            question.concepts.every((concept) => concept && typeof concept.id === "string" &&
              typeof concept.title === "string" && typeof concept.question === "string" && typeof concept.expectedAnswer === "string");
        }
        return false;
      });
  } catch {
    return [];
  }
};

const newQuestion = (type) => {
  const question = {
    id: createLocalId(),
    type,
    title: "",
    media: [],
  };

  if (type === "abc") return { ...question, options: ["", "", "", ""], optionMedia: [[], [], [], []], correctOption: 0 };
  if (type === "sort") return { ...question, items: ["", "", "", ""], itemMedia: [[], [], [], []] };
  if (type === "concepts") return { ...question, concepts: [newConceptCard()] };
  return {
    ...question,
    pairs: Array.from({ length: 4 }, () => ({ left: "", right: "" })),
    pairMedia: Array.from({ length: 4 }, () => ({ left: [], right: [] })),
  };
};

const questionFromApi = (question) => {
  const common = {
    id: question.id,
    type: question.type,
    title: question.title,
    media: question.media || [],
  };

  if (question.type === "abc") {
    return normalizeQuestion({
      ...common,
      options: question.options.map((option) => option.text),
      optionMedia: question.options.map((option) => option.media || []),
      correctOption: question.correctOption,
    });
  }
  if (question.type === "sort") {
    return normalizeQuestion({
      ...common,
      items: question.items.map((item) => item.text),
      itemMedia: question.items.map((item) => item.media || []),
    });
  }
  if (question.type === "concepts") {
    return normalizeQuestion({
      ...common,
      concepts: question.concepts.map((concept) => ({
        id: concept.id,
        title: concept.title,
        question: concept.question.text,
        expectedAnswer: concept.expectedAnswer.text,
        media: concept.media || [],
        questionMedia: concept.question.media || [],
        expectedAnswerMedia: concept.expectedAnswer.media || [],
      })),
    });
  }
  return normalizeQuestion({
    ...common,
    pairs: question.pairs.map((pair) => ({ left: pair.left.text, right: pair.right.text })),
    pairMedia: question.pairs.map((pair) => ({ left: pair.left.media || [], right: pair.right.media || [] })),
  });
};

const questionToApi = (question, order) => {
  const common = {
    id: question.id,
    type: question.type,
    title: question.title,
    order,
    media: question.media || [],
  };

  if (question.type === "abc") {
    return {
      ...common,
      options: question.options.map((text, index) => ({ text, media: question.optionMedia?.[index] || [] })),
      correctOption: question.correctOption,
    };
  }
  if (question.type === "sort") {
    return {
      ...common,
      items: question.items.map((text, index) => ({ text, media: question.itemMedia?.[index] || [] })),
    };
  }
  if (question.type === "concepts") {
    return {
      ...common,
      concepts: question.concepts.map((concept) => ({
        id: concept.id,
        title: concept.title,
        question: { text: concept.question, media: concept.questionMedia || [] },
        expectedAnswer: { text: concept.expectedAnswer, media: concept.expectedAnswerMedia || [] },
        media: concept.media || [],
      })),
    };
  }
  return {
    ...common,
    pairs: question.pairs.map((pair, index) => ({
      left: { text: pair.left, media: question.pairMedia?.[index]?.left || [] },
      right: { text: pair.right, media: question.pairMedia?.[index]?.right || [] },
    })),
  };
};

export function EditActivityPage() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionsActivityId, setQuestionsActivityId] = useState(null);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [questionsDirty, setQuestionsDirty] = useState(false);
  const [questionSaveStatus, setQuestionSaveStatus] = useState("saved");
  const [questionSaveError, setQuestionSaveError] = useState("");
  const [questionSaveRetry, setQuestionSaveRetry] = useState(0);
  const [localSaveError, setLocalSaveError] = useState(false);
  const questionSaveQueue = useRef(Promise.resolve());
  const questionSaveRevision = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    questionSaveRevision.current += 1;
    setIsLoading(true);
    setLoadError("");
    setQuestionsReady(false);
    setQuestionsDirty(false);

    activityService.get(activityId, controller.signal)
      .then((loadedActivity) => {
        setActivity(loadedActivity);
        const serverQuestions = Array.isArray(loadedActivity.questions)
          ? loadedActivity.questions.map(questionFromApi)
          : [];
        const localQuestions = readStoredQuestions(activityId);
        const restoreLocalDraft = serverQuestions.length === 0 && localQuestions.length > 0;
        setQuestions(restoreLocalDraft ? localQuestions : serverQuestions);
        setQuestionsActivityId(activityId);
        setQuestionsDirty(restoreLocalDraft);
        setQuestionSaveStatus(restoreLocalDraft ? "pending" : "saved");
        setQuestionsReady(true);
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setLoadError(error.response?.data?.message || "No se pudo cargar esta actividad.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [activityId]);

  useEffect(() => {
    if (!questionsReady || questionsActivityId !== activityId) return;
    try {
      window.localStorage.setItem(questionsStorageKey(activityId), JSON.stringify(questions));
      setLocalSaveError(false);
    } catch {
      setLocalSaveError(true);
    }
  }, [activityId, questions, questionsActivityId, questionsReady]);

  useEffect(() => {
    if (!questionsReady || !questionsDirty || questionsActivityId !== activityId) return undefined;

    const revision = questionSaveRevision.current + 1;
    questionSaveRevision.current = revision;
    const payload = questions.map(questionToApi);
    const timeout = window.setTimeout(() => {
      setQuestionSaveStatus("saving");
      setQuestionSaveError("");

      const saveTask = questionSaveQueue.current
        .catch(() => undefined)
        .then(() => activityService.saveQuestions(activityId, payload));
      questionSaveQueue.current = saveTask;

      saveTask
        .then(() => {
          if (questionSaveRevision.current !== revision) return;
          setQuestionsDirty(false);
          setQuestionSaveStatus("saved");
        })
        .catch((error) => {
          if (questionSaveRevision.current !== revision) return;
          setQuestionSaveError(error.response?.data?.message || "No se pudieron guardar las preguntas en la actividad.");
          setQuestionSaveStatus("error");
        });
    }, 700);

    setQuestionSaveStatus("pending");
    return () => window.clearTimeout(timeout);
  }, [activityId, questions, questionsActivityId, questionsDirty, questionsReady, questionSaveRetry]);

  const updateQuestion = (questionId, update) => {
    setQuestionsDirty(true);
    setQuestions((current) => current.map((question) =>
      question.id === questionId ? { ...question, ...update } : question
    ));
  };

  const updateOption = (question, optionIndex, value) => {
    const options = [...question.options];
    options[optionIndex] = value;
    updateQuestion(question.id, { options });
  };

  const addQuestion = (type) => {
    setQuestionsDirty(true);
    setQuestions((current) => [...current, newQuestion(type)]);
    setTypePickerOpen(false);
  };

  const updateSortItem = (question, itemIndex, value) => {
    const items = [...question.items];
    items[itemIndex] = value;
    updateQuestion(question.id, { items });
  };

  const updatePair = (question, pairIndex, side, value) => {
    const pairs = question.pairs.map((pair, index) =>
      index === pairIndex ? { ...pair, [side]: value } : pair
    );
    updateQuestion(question.id, { pairs });
  };

  const addQuestionEntry = (question, key, entry) => {
    if (key === "concepts" && question.concepts.length >= 3) return;
    const mediaKey = { options: "optionMedia", items: "itemMedia", pairs: "pairMedia" }[key];
    const mediaEntry = key === "pairs" ? { left: [], right: [] } : [];
    updateQuestion(question.id, {
      [key]: [...question[key], entry],
      ...(mediaKey ? { [mediaKey]: [...(question[mediaKey] || []), mediaEntry] } : {}),
    });
  };

  const removeQuestionEntry = (question, key, entryIndex) => {
    const minimumEntries = key === "concepts" ? 1 : 2;
    if (question[key].length <= minimumEntries) return;
    const entries = question[key].filter((_entry, index) => index !== entryIndex);
    const update = { [key]: entries };

    if (key === "options") {
      update.correctOption = question.correctOption === entryIndex
        ? Math.min(entryIndex, entries.length - 1)
        : question.correctOption > entryIndex
          ? question.correctOption - 1
          : question.correctOption;
    }

    const mediaKey = { options: "optionMedia", items: "itemMedia", pairs: "pairMedia" }[key];
    if (mediaKey) {
      update[mediaKey] = (question[mediaKey] || []).filter((_media, index) => index !== entryIndex);
    }

    updateQuestion(question.id, update);
  };

  const updateConceptCard = (question, conceptId, changes) => {
    const concepts = question.concepts.map((concept) =>
      concept.id === conceptId ? { ...concept, ...changes } : concept
    );
    updateQuestion(question.id, { concepts });
  };

  const saveActivityDetails = async (values) => {
    setIsSaving(true);
    setSaveError("");
    try {
      const updatedActivity = await activityService.update(activityId, values);
      setActivity(updatedActivity);
      setModalOpen(false);
    } catch (error) {
      setSaveError(error.response?.data?.message || "No se pudieron guardar los datos de la actividad.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <main className="relative isolate h-[100svh] overflow-x-clip overflow-y-auto overscroll-y-contain bg-[#fbfbf6] text-[#124d3b] [background-image:radial-gradient(circle_at_0%_0%,#e1efdc_0,transparent_22%)]">
        <PageDecorations footer="waves" />
        <TeacherHeader sticky />

        <div className="mx-auto w-[calc(100%-40px)] max-w-[1120px] px-0 pb-[190px] pt-5 sm:w-[calc(100%-64px)] sm:pt-8 2xl:w-[calc(100%-120px)]">
          <button type="button" onClick={() => navigate("/manage")} className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-bold text-[#17654d] transition hover:bg-[#eaf3e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b4b]">
            <ManageIcon name="back" className="h-4 w-4" />
            Volver a actividades
          </button>

          {isLoading ? (
            <section role="status" className="rounded-2xl border border-[#e4ebdf] bg-white/80 px-5 py-12 text-center text-sm font-semibold text-[#718078]">
              Cargando actividad...
            </section>
          ) : loadError && !activity ? (
            <section role="alert" className="rounded-2xl border border-[#e4ebdf] bg-white px-5 py-10 text-center">
              <p className="font-extrabold">{loadError}</p>
              <button type="button" onClick={() => navigate("/manage")} className="mt-4 rounded-full bg-[#006b4b] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#00583f]">
                Volver a actividades
              </button>
            </section>
          ) : activity && (
            <>
              <section aria-labelledby="activity-details-title" className="mb-8 rounded-2xl border border-[#e4ebdf] bg-white p-4 shadow-[0_8px_24px_rgba(0,76,51,0.05)] sm:p-6">
                {saveError && <p role="alert" className="mb-4 rounded-lg bg-[#fff0ef] px-3 py-2 text-sm font-semibold text-[#a8322c]">{saveError}</p>}
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl sm:h-16 sm:w-16" style={{ backgroundColor: `${activity.color}22`, color: activity.color }}>
                      <ManageIcon name={activity.icon} className="h-7 w-7" />
                    </span>
                    <div className="min-w-0">
                      <p id="activity-details-title" className="mb-1 text-xs font-extrabold uppercase text-[#718078]">Información de la actividad</p>
                      <h1 className="break-words text-xl font-black text-[#00583f] sm:text-2xl">{activity.title}</h1>
                      <p className="mt-1 max-w-[680px] text-sm leading-relaxed text-[#718078]">{activity.description || "Sin descripción"}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-[#53665b]">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: activity.color }} />
                          {activity.color}
                        </span>
                        <span className={`inline-flex items-center gap-2 ${activity.active ? "text-[#117a3d]" : "text-[#718078]"}`}>
                          <span className={`h-2 w-2 rounded-full ${activity.active ? "bg-[#1fae5a]" : "bg-[#b9c2bb]"}`} />
                          {activity.active ? "Activa" : "Inactiva"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={() => setModalOpen(true)} className="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-[#dce8d7] bg-[#f7faf4] px-4 text-sm font-extrabold text-[#006b4b] transition hover:bg-[#edf6e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b4b] sm:w-auto">
                    <ManageIcon name="edit" />
                    Editar información
                  </button>
                </div>
              </section>

              <section aria-labelledby="questions-title">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 id="questions-title" className="text-xl font-black text-[#00583f] sm:text-2xl">Preguntas de la actividad</h2>
                    <p className="mt-1 text-sm text-[#718078]">Elige un formato para cada pregunta.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span role="status" className={`text-xs font-semibold ${localSaveError || questionSaveStatus === "error" ? "text-[#b83a34]" : "text-[#117a3d]"}`}>
                      {localSaveError
                        ? "Copia local no disponible"
                        : questionSaveStatus === "saving"
                          ? "Guardando en la actividad..."
                          : questionSaveStatus === "pending"
                            ? "Cambios pendientes..."
                            : questionSaveStatus === "error"
                              ? questionSaveError
                              : "Guardado en la actividad"}
                    </span>
                    {questionSaveStatus === "error" && (
                      <button type="button" onClick={() => setQuestionSaveRetry((retry) => retry + 1)} className="text-xs font-extrabold text-[#006b4b] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b4b]">
                        Reintentar
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4">
                  {questions.map((question, questionIndex) => (
                    <article key={question.id} className="rounded-xl border border-[#e4ebdf] bg-white p-4 shadow-[0_5px_18px_rgba(0,76,51,0.035)] sm:p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-extrabold text-[#17654d]">Pregunta {String(questionIndex + 1).padStart(2, "0")}</h3>
                          <p className="mt-0.5 text-xs text-[#718078]">{questionTypeLabels[question.type]}</p>
                        </div>
                        <button type="button" onClick={() => { setQuestionsDirty(true); setQuestions((current) => current.filter((item) => item.id !== question.id)); }} title="Eliminar pregunta" aria-label={`Eliminar pregunta ${questionIndex + 1}`} className="grid h-9 w-9 place-items-center rounded-lg text-[#b83a34] transition hover:bg-[#fff0ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b83a34]">
                          <ManageIcon name="trash" />
                        </button>
                      </div>

                      <label htmlFor={`question-${question.id}`} className="mb-2 block text-sm font-bold text-[#124d3b]">Título de la pregunta</label>
                      <input id={`question-${question.id}`} value={question.title} onChange={(event) => updateQuestion(question.id, { title: event.target.value })} maxLength={120} placeholder="Escribe un título..." className="mb-4 min-h-12 w-full rounded-lg border border-[#dbe5d7] bg-white px-3 text-sm text-[#124d3b] outline-none transition placeholder:text-[#99a49d] focus:border-[#006b4b] focus:ring-4 focus:ring-[#006b4b]/10" />

                      {question.type === "abc" && (
                        <fieldset>
                          <legend className="mb-2 text-sm font-bold text-[#124d3b]">Opciones <span className="font-normal text-[#718078]">(marca la respuesta correcta)</span></legend>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className={`flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2 transition ${question.correctOption === optionIndex ? "border-[#87bd92] bg-[#f0f8ef]" : "border-[#e4ebdf] bg-[#fbfcf9]"}`}>
                                <input type="radio" name={`correct-${question.id}`} checked={question.correctOption === optionIndex} onChange={() => updateQuestion(question.id, { correctOption: optionIndex })} aria-label={`Marcar opción ${answerLabel(optionIndex)} como correcta`} className="h-4 w-4 shrink-0 accent-[#087b55]" />
                                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white text-xs font-black text-[#17654d]">{answerLabel(optionIndex)}</span>
                                <input value={option} onChange={(event) => updateOption(question, optionIndex, event.target.value)} maxLength={200} aria-label={`Texto de la opción ${answerLabel(optionIndex)}`} placeholder={`Opción ${answerLabel(optionIndex)}`} className="min-w-0 flex-1 bg-transparent text-sm text-[#124d3b] outline-none placeholder:text-[#99a49d]" />
                                <button type="button" onClick={() => removeQuestionEntry(question, "options", optionIndex)} disabled={question.options.length <= 2} title={`Eliminar opción ${answerLabel(optionIndex)}`} aria-label={`Eliminar opción ${answerLabel(optionIndex)}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#b83a34] transition hover:bg-[#fff0ef] disabled:cursor-not-allowed disabled:opacity-30">
                                  <ManageIcon name="close" className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button type="button" onClick={() => addQuestionEntry(question, "options", "")} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-xs font-extrabold text-[#006b4b] hover:bg-[#edf6e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b4b]">
                            <ManageIcon name="plus" className="h-4 w-4" />
                            Agregar opción
                          </button>
                        </fieldset>
                      )}

                      {question.type === "sort" && (
                        <fieldset>
                          <legend className="mb-2 text-sm font-bold text-[#124d3b]">Elementos en el orden correcto</legend>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {question.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex min-w-0 items-center gap-2 rounded-lg border border-[#e4ebdf] bg-[#fbfcf9] px-3 py-2">
                                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white text-xs font-black text-[#17654d]">{itemIndex + 1}</span>
                                <input value={item} onChange={(event) => updateSortItem(question, itemIndex, event.target.value)} maxLength={200} aria-label={`Elemento en posición ${itemIndex + 1}`} placeholder={`Elemento ${itemIndex + 1}`} className="min-w-0 flex-1 bg-transparent text-sm text-[#124d3b] outline-none placeholder:text-[#99a49d]" />
                                <button type="button" onClick={() => removeQuestionEntry(question, "items", itemIndex)} disabled={question.items.length <= 2} title={`Eliminar elemento ${itemIndex + 1}`} aria-label={`Eliminar elemento ${itemIndex + 1}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#b83a34] transition hover:bg-[#fff0ef] disabled:cursor-not-allowed disabled:opacity-30">
                                  <ManageIcon name="close" className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button type="button" onClick={() => addQuestionEntry(question, "items", "")} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-xs font-extrabold text-[#006b4b] hover:bg-[#edf6e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b4b]">
                            <ManageIcon name="plus" className="h-4 w-4" />
                            Agregar elemento
                          </button>
                        </fieldset>
                      )}

                      {question.type === "lines" && (
                        <fieldset>
                          <legend className="mb-2 text-sm font-bold text-[#124d3b]">Pares que se deben unir</legend>
                          <div className="mb-1 hidden grid-cols-[1fr_auto_1fr] gap-2 px-3 text-xs font-bold text-[#718078] sm:grid">
                            <span>Elemento izquierdo</span><span aria-hidden="true" /><span>Elemento relacionado</span>
                          </div>
                          <div className="grid gap-2">
                            {question.pairs.map((pair, pairIndex) => (
                              <div key={pairIndex} className="grid items-center gap-2 rounded-lg border border-[#e4ebdf] bg-[#fbfcf9] p-2 sm:grid-cols-[1fr_auto_1fr]">
                                <input value={pair.left} onChange={(event) => updatePair(question, pairIndex, "left", event.target.value)} maxLength={200} aria-label={`Elemento izquierdo del par ${pairIndex + 1}`} placeholder={`Elemento ${pairIndex + 1}`} className="min-w-0 rounded-md bg-white px-2.5 py-2 text-sm text-[#124d3b] outline-none placeholder:text-[#99a49d] focus:ring-2 focus:ring-[#006b4b]/20" />
                                <span aria-hidden="true" className="hidden text-[#87bd92] sm:block">↔</span>
                                <input value={pair.right} onChange={(event) => updatePair(question, pairIndex, "right", event.target.value)} maxLength={200} aria-label={`Elemento relacionado del par ${pairIndex + 1}`} placeholder="Se une con..." className="min-w-0 rounded-md bg-white px-2.5 py-2 text-sm text-[#124d3b] outline-none placeholder:text-[#99a49d] focus:ring-2 focus:ring-[#006b4b]/20" />
                                <button type="button" onClick={() => removeQuestionEntry(question, "pairs", pairIndex)} disabled={question.pairs.length <= 2} title={`Eliminar par ${pairIndex + 1}`} aria-label={`Eliminar par ${pairIndex + 1}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#b83a34] transition hover:bg-[#fff0ef] disabled:cursor-not-allowed disabled:opacity-30 sm:col-span-3 sm:justify-self-end">
                                  <ManageIcon name="close" className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button type="button" onClick={() => addQuestionEntry(question, "pairs", { left: "", right: "" })} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-xs font-extrabold text-[#006b4b] hover:bg-[#edf6e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b4b]">
                            <ManageIcon name="plus" className="h-4 w-4" />
                            Agregar par
                          </button>
                        </fieldset>
                      )}

                      {question.type === "concepts" && (
                        <fieldset>
                          <legend className="mb-3 flex w-full items-center justify-between gap-3 text-sm font-bold text-[#124d3b]">
                            <span>Tarjetas de conceptos</span>
                            <span className="text-xs font-semibold text-[#8b6811]">{question.concepts.length} / 3</span>
                          </legend>
                          <div className="grid gap-3">
                            {question.concepts.map((concept, conceptIndex) => (
                              <article key={concept.id} className="rounded-lg border border-[#e6d39b] bg-[#fffdf7] p-3 sm:p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <h4 className="text-xs font-black uppercase text-[#85630b]">Tarjeta {conceptIndex + 1}</h4>
                                  <button type="button" onClick={() => removeQuestionEntry(question, "concepts", conceptIndex)} disabled={question.concepts.length <= 1} title={`Eliminar tarjeta ${conceptIndex + 1}`} aria-label={`Eliminar tarjeta de concepto ${conceptIndex + 1}`} className="grid h-8 w-8 place-items-center rounded-md text-[#9a6516] transition hover:bg-[#fff0d0] disabled:cursor-not-allowed disabled:opacity-30">
                                    <ManageIcon name="close" className="h-4 w-4" />
                                  </button>
                                </div>
                                <label htmlFor={`concept-title-${concept.id}`} className="mb-1.5 block text-xs font-bold text-[#124d3b]">Concepto</label>
                                <input id={`concept-title-${concept.id}`} value={concept.title} onChange={(event) => updateConceptCard(question, concept.id, { title: event.target.value })} maxLength={120} placeholder="Nombre del concepto" className="mb-3 min-h-10 w-full rounded-md border border-[#e4ebdf] bg-white px-3 text-sm text-[#124d3b] outline-none placeholder:text-[#99a49d] focus:border-[#b78a1a] focus:ring-2 focus:ring-[#d4aa43]/25" />
                                <label htmlFor={`concept-question-${concept.id}`} className="mb-1.5 block text-xs font-bold text-[#124d3b]">Pregunta sorpresa</label>
                                <textarea id={`concept-question-${concept.id}`} value={concept.question} onChange={(event) => updateConceptCard(question, concept.id, { question: event.target.value })} maxLength={500} rows={2} placeholder="¿Qué pregunta aparecerá al elegir esta tarjeta?" className="mb-3 min-h-10 w-full resize-y rounded-md border border-[#e4ebdf] bg-white px-3 py-2 text-sm text-[#124d3b] outline-none placeholder:text-[#99a49d] focus:border-[#b78a1a] focus:ring-2 focus:ring-[#d4aa43]/25" />
                                <label htmlFor={`concept-answer-${concept.id}`} className="mb-1.5 block text-xs font-bold text-[#124d3b]">Respuesta esperada</label>
                                <textarea id={`concept-answer-${concept.id}`} value={concept.expectedAnswer} onChange={(event) => updateConceptCard(question, concept.id, { expectedAnswer: event.target.value })} maxLength={500} rows={2} placeholder="Describe qué debería responder el estudiante" className="min-h-10 w-full resize-y rounded-md border border-[#e4ebdf] bg-white px-3 py-2 text-sm text-[#124d3b] outline-none placeholder:text-[#99a49d] focus:border-[#b78a1a] focus:ring-2 focus:ring-[#d4aa43]/25" />
                              </article>
                            ))}
                          </div>
                          <button type="button" onClick={() => addQuestionEntry(question, "concepts", newConceptCard())} disabled={question.concepts.length >= 3} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-xs font-extrabold text-[#85630b] transition hover:bg-[#fff5d6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b78a1a] disabled:cursor-not-allowed disabled:opacity-40">
                            <ManageIcon name="plus" className="h-4 w-4" />
                            Agregar tarjeta
                          </button>
                        </fieldset>
                      )}
                    </article>
                  ))}
                </div>

                {typePickerOpen && (
                  <div role="group" aria-label="Tipo de pregunta" className="mt-4 rounded-xl border border-[#dce8d7] bg-white p-4 shadow-[0_8px_24px_rgba(0,76,51,0.05)]">
                    <p className="mb-3 text-sm font-extrabold text-[#124d3b]">¿Qué tipo de pregunta quieres crear?</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {Object.entries(questionTypeLabels).map(([type, label]) => (
                        <button key={type} type="button" onClick={() => addQuestion(type)} className={`min-h-11 rounded-lg px-3 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b4b] ${type === "concepts" ? "border-2 border-[#c89a21] bg-[#fff5d6] text-[#76580c] shadow-[0_2px_10px_rgba(194,151,37,0.12)] hover:bg-[#ffefc2]" : "border border-[#e4ebdf] bg-[#f7faf4] text-[#17654d] hover:border-[#87bd92] hover:bg-[#edf6e9]"}`}>
                          {type === "concepts" && <span aria-hidden="true" className="mr-1 text-[#b18410]">★</span>}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button type="button" onClick={() => setTypePickerOpen((open) => !open)} aria-expanded={typePickerOpen} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-[#87bd92] bg-white/80 px-4 text-sm font-extrabold text-[#006b4b] transition hover:bg-[#edf6e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b4b]">
                  <ManageIcon name="plus" />
                  {typePickerOpen ? "Cancelar" : "Añadir pregunta"}
                </button>
              </section>
            </>
          )}
        </div>
      </main>

      <ActivityEditModal open={modalOpen} activity={activity} onClose={() => setModalOpen(false)} onSave={saveActivityDetails} saving={isSaving} />
    </>
  );
}

export default EditActivityPage;