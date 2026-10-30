import { useState, useRef, useEffect } from "react";
import { useSaveQuestions } from "./useActivityMutations.js";
import { minimumEntries } from "../lib/questionValidation.js";
import {
  newConceptCard,
  newQuestion,
  questionFromApi,
  questionToApi,
} from "../lib/questionModel.js";
import { readStoredQuestions, writeStoredQuestions } from "../lib/draftStorage.js";
import { validateQuestionsForSave } from "../lib/questionValidation.js";

/**
 * Manages the activity question editor draft:
 * - loads server questions or restores a local draft,
 * - persists to localStorage on every change,
 * - debounces server saves (700ms) with revision-based cancelation.
 */
export function useQuestionDraft(activityId, serverQuestions = []) {
  const [questions, setQuestions] = useState([]);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [questionsDirty, setQuestionsDirty] = useState(false);
  const [questionSaveStatus, setQuestionSaveStatus] = useState("saved");
  const [questionSaveError, setQuestionSaveError] = useState("");
  const [localSaveError, setLocalSaveError] = useState(false);

  const questionSaveQueue = useRef(Promise.resolve());
  const questionSaveRevision = useRef(0);

  const saveQuestionsMutation = useSaveQuestions();

  useEffect(() => {
    const loaded = Array.isArray(serverQuestions)
      ? serverQuestions.map(questionFromApi)
      : [];
    const local = readStoredQuestions(activityId);
    const restoreLocalDraft = loaded.length === 0 && local.length > 0;

    setQuestions(restoreLocalDraft ? local : loaded);
    setQuestionsDirty(restoreLocalDraft);
    setQuestionSaveStatus(restoreLocalDraft ? "pending" : "saved");
    setQuestionsReady(true);
  }, [activityId, serverQuestions]);

  useEffect(() => {
    if (!questionsReady) return;
    const ok = writeStoredQuestions(activityId, questions);
    setLocalSaveError(!ok);
  }, [activityId, questions, questionsReady]);

  useEffect(() => {
    if (!questionsReady || !questionsDirty) return undefined;

    const validationMessage = validateQuestionsForSave(questions);
    if (validationMessage) {
      setQuestionSaveError(validationMessage);
      setQuestionSaveStatus("incomplete");
      return undefined;
    }

    const revision = questionSaveRevision.current + 1;
    questionSaveRevision.current = revision;
    const payload = questions.map((q, order) => questionToApi(q, order));

    const timeout = window.setTimeout(() => {
      setQuestionSaveStatus("saving");
      setQuestionSaveError("");

      const saveTask = questionSaveQueue.current
        .catch(() => undefined)
        .then(() => saveQuestionsMutation.mutateAsync({ id: activityId, questions: payload }));

      saveTask
        .then(() => {
          if (questionSaveRevision.current !== revision) return;
          setQuestionsDirty(false);
          setQuestionSaveStatus("saved");
        })
        .catch((error) => {
          if (questionSaveRevision.current !== revision) return;
          setQuestionSaveError(
            error?.response?.data?.message || "No se pudieron guardar las preguntas en la actividad."
          );
          setQuestionSaveStatus("error");
        });
    }, 700);

    setQuestionSaveStatus("pending");
    setQuestionSaveError("");

    return () => window.clearTimeout(timeout);
  }, [
    activityId,
    questions,
    questionsDirty,
    questionsReady,
    saveQuestionsMutation,
  ]);

  const updateQuestion = (questionId, update) => {
    setQuestionsDirty(true);
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId ? { ...question, ...update } : question
      )
    );
  };

  const updateOption = (question, optionIndex, value) => {
    const options = [...question.options];
    options[optionIndex] = value;
    updateQuestion(question.id, { options });
  };

  const addQuestion = (type) => {
    setQuestionsDirty(true);
    setQuestions((current) => [...current, newQuestion(type)]);
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
    if (question[key].length <= minimumEntries) return;
    const entries = question[key].filter((_entry, index) => index !== entryIndex);
    const update = { [key]: entries };

    if (key === "options") {
      update.correctOption =
        question.correctOption === entryIndex
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

  const addConceptCard = (question) =>
    addQuestionEntry(question, "concepts", newConceptCard());

  const removeQuestion = (questionId) => {
    setQuestionsDirty(true);
    setQuestions((current) => current.filter((item) => item.id !== questionId));
  };

  return {
    questions,
    setQuestions,
    questionsReady,
    questionsDirty,
    questionSaveStatus,
    questionSaveError,
    localSaveError,
    updateQuestion,
    updateOption,
    addQuestion,
    updateSortItem,
    updatePair,
    addQuestionEntry,
    removeQuestionEntry,
    updateConceptCard,
    addConceptCard,
    removeQuestion,
  };
}

export default useQuestionDraft;
