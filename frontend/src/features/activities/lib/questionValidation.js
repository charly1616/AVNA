/**
 * Draft validation rules for the activities editor.
 */
export const minimumEntries = 2;

export const validateQuestionsForSave = (questions) => {
  const hasIncompleteConceptCard = questions.some((question) =>
    question.type === "concepts" &&
    question.concepts.some((concept) =>
      !concept.title.trim() ||
      (!concept.question.trim() && !concept.questionMedia.length) ||
      (!concept.expectedAnswer.trim() && !concept.expectedAnswerMedia.length)
    )
  );

  return hasIncompleteConceptCard
    ? "Completa el concepto, la pregunta y la respuesta de cada tarjeta para guardar."
    : "";
};

export default { validateQuestionsForSave, minimumEntries };
