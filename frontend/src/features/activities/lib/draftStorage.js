/**
 * Local draft persistence for activity questions.
 * Drafts are keyed per activity so an in-progress edit survives a refresh.
 */

export const readStoredQuestions = (activityId) => {
  try {
    const stored = window.localStorage.getItem(`teacher-portal:activity-questions:${activityId}`);
    const questions = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(questions)) return [];

    return questions
      .map((q) => q)
      .filter((question) => {
        if (!question || typeof question.id !== "string" || typeof question.title !== "string") return false;
        if (question.type === "abc") {
          return (
            Array.isArray(question.options) &&
            question.options.length >= 2 &&
            question.options.every((option) => typeof option === "string") &&
            Number.isInteger(question.correctOption) &&
            question.correctOption >= 0 &&
            question.correctOption < question.options.length
          );
        }
        if (question.type === "sort") {
          return (
            Array.isArray(question.items) &&
            question.items.length >= 2 &&
            question.items.every((item) => typeof item === "string")
          );
        }
        if (question.type === "lines") {
          return (
            Array.isArray(question.pairs) &&
            question.pairs.length >= 2 &&
            question.pairs.every((pair) => pair && typeof pair.left === "string" && typeof pair.right === "string")
          );
        }
        if (question.type === "concepts") {
          return (
            Array.isArray(question.concepts) &&
            question.concepts.length >= 2 &&
            question.concepts.length <= 4 &&
            question.concepts.every(
              (concept) =>
                concept &&
                typeof concept.id === "string" &&
                typeof concept.title === "string" &&
                typeof concept.question === "string" &&
                typeof concept.expectedAnswer === "string"
            )
          );
        }
        return false;
      });
  } catch {
    return [];
  }
};

export const writeStoredQuestions = (activityId, questions) => {
  try {
    window.localStorage.setItem(
      `teacher-portal:activity-questions:${activityId}`,
      JSON.stringify(questions)
    );
    return true;
  } catch {
    return false;
  }
};

export default { readStoredQuestions, writeStoredQuestions };
