/**
 * Question model helpers for the activities feature.
 * Extracted from EditActivityPage so question shape logic lives in one place
 * and can be tested independently of the UI.
 */

export const questionsStorageKey = (activityId) => `teacher-portal:activity-questions:${activityId}`;

export const createLocalId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const normalizeQuestion = (question) => {
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
      expectedAnswerMedia: Array.isArray(concept.expectedAnswerMedia)
        ? concept.expectedAnswerMedia
        : [],
    }));
  }

  return normalized;
};

export const newConceptCard = () => ({
  id: createLocalId(),
  title: "",
  question: "",
  expectedAnswer: "",
  media: [],
  questionMedia: [],
  expectedAnswerMedia: [],
});

export const newQuestion = (type) => {
  const question = {
    id: createLocalId(),
    type,
    title: "",
    media: [],
  };

  if (type === "abc") {
    return { ...question, options: ["", "", "", ""], optionMedia: [[], [], [], []], correctOption: 0 };
  }
  if (type === "sort") {
    return { ...question, items: ["", "", "", ""], itemMedia: [[], [], [], []] };
  }
  if (type === "concepts") {
    return { ...question, concepts: [newConceptCard(), newConceptCard()] };
  }
  return {
    ...question,
    pairs: Array.from({ length: 4 }, () => ({ left: "", right: "" })),
    pairMedia: Array.from({ length: 4 }, () => ({ left: [], right: [] })),
  };
};

export const questionFromApi = (question) => {
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

export const questionToApi = (question, order) => {
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

export default {
  questionsStorageKey,
  createLocalId,
  normalizeQuestion,
  newConceptCard,
  newQuestion,
  questionFromApi,
  questionToApi,
};
