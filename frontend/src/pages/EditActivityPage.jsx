import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ActivityDetailsCard from "../components/manage/ActivityDetailsCard.jsx";
import ActivityEditModal from "../components/manage/ActivityEditModal.jsx";
import ActivityQuestionsSection from "../components/manage/ActivityQuestionsSection.jsx";
import ManageIcon from "../components/manage/ManageIcon.jsx";
import PageDecorations from "../components/layout/PageDecorations.jsx";
import TeacherHeader from "../components/layout/TeacherHeader.jsx";
import activityService from "../api/activity.service.js";

const questionsStorageKey = (activityId) => `teacher-portal:activity-questions:${activityId}`;
const createLocalId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const validateQuestionsForSave = (questions) => {
  const hasIncompleteConceptCard = questions.some((question) =>
    question.type === "concepts" && question.concepts.some((concept) =>
      !concept.title.trim() ||
      (!concept.question.trim() && !concept.questionMedia.length) ||
      (!concept.expectedAnswer.trim() && !concept.expectedAnswerMedia.length)
    )
  );

  return hasIncompleteConceptCard
    ? "Completa el concepto, la pregunta y la respuesta de cada tarjeta para guardar."
    : "";
};

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
          return Array.isArray(question.concepts) && question.concepts.length >= 2 && question.concepts.length <= 4 &&
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
  if (type === "concepts") return { ...question, concepts: [newConceptCard(), newConceptCard()] };
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

    const validationMessage = validateQuestionsForSave(questions);
    if (validationMessage) {
      questionSaveRevision.current += 1;
      setQuestionSaveError(validationMessage);
      setQuestionSaveStatus("incomplete");
      return undefined;
    }

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
    setQuestionSaveError("");
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
    if (key === "concepts" && question.concepts.length >= 4) return;
    const mediaKey = { options: "optionMedia", items: "itemMedia", pairs: "pairMedia" }[key];
    const mediaEntry = key === "pairs" ? { left: [], right: [] } : [];
    updateQuestion(question.id, {
      [key]: [...question[key], entry],
      ...(mediaKey ? { [mediaKey]: [...(question[mediaKey] || []), mediaEntry] } : {}),
    });
  };

  const removeQuestionEntry = (question, key, entryIndex) => {
    const minimumEntries = 2;
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

        <div className="mx-auto w-[calc(100%-40px)] max-w-[1440px] px-0 pb-[190px] pt-5 sm:w-[calc(100%-64px)] sm:pt-8 2xl:w-[calc(100%-120px)]">
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
              <ActivityDetailsCard activity={activity} saveError={saveError} onEdit={() => setModalOpen(true)} />

              <ActivityQuestionsSection
                questions={questions}
                saveStatus={questionSaveStatus}
                saveError={questionSaveError}
                localSaveError={localSaveError}
                retrySave={() => setQuestionSaveRetry((retry) => retry + 1)}
                typePickerOpen={typePickerOpen}
                onToggleTypePicker={() => setTypePickerOpen((open) => !open)}
                onAddQuestion={addQuestion}
                onRemoveQuestion={(questionId) => {
                  setQuestionsDirty(true);
                  setQuestions((current) => current.filter((item) => item.id !== questionId));
                }}
                onUpdateQuestion={updateQuestion}
                onUpdateOption={updateOption}
                onUpdateSortItem={updateSortItem}
                onUpdatePair={updatePair}
                onAddEntry={addQuestionEntry}
                onRemoveEntry={removeQuestionEntry}
                onUpdateConceptCard={updateConceptCard}
                onAddConcept={(question) => addQuestionEntry(question, "concepts", newConceptCard())}
              />
            </>
          )}
        </div>
      </main>

      <ActivityEditModal open={modalOpen} activity={activity} onClose={() => setModalOpen(false)} onSave={saveActivityDetails} saving={isSaving} />
    </>
  );
}

export default EditActivityPage;