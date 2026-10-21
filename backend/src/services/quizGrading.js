/**
 * Pure grading helpers. They never touch the database, so they can be tested
 * on their own.
 */

export const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const sameOrder = (left, right) =>
  Array.isArray(left) &&
  Array.isArray(right) &&
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

const sameMatches = (left, right) => {
  if (!Array.isArray(left) || !Array.isArray(right)) return false;
  if (left.length !== right.length) return false;

  const expected = new Map(right.map((match) => [match.leftId, match.rightId]));

  return left.every((match) => expected.get(match.leftId) === match.rightId);
};

const gradeConcepts = (question, value) => {
  const submitted = new Map(
    (Array.isArray(value?.cards) ? value.cards : []).map((card) => [card.cardId, card.text])
  );

  return question.cards.every((card) => {
    const expected = question.correct?.answers?.[card.id] ?? "";

    // A card without an expected answer is self evaluated.
    if (!expected.trim()) return true;

    return normalizeText(submitted.get(card.id)) === normalizeText(expected);
  });
};

export const gradeAnswer = (question, value) => {
  if (!question || !question.correct) return false;

  switch (question.type) {
    case "abc":
      return value?.optionId === question.correct.optionId;
    case "sort":
      return sameOrder(value?.order, question.correct.order);
    case "lines":
      return sameMatches(value?.matches, question.correct.matches);
    case "concepts":
      return gradeConcepts(question, value);
    default:
      return false;
  }
};

export const gradeAll = (questions, answers) => {
  const byQuestion = new Map((answers ?? []).map((answer) => [answer.questionId, answer]));

  return questions.map((question) => ({
    questionId: question.id,
    type: question.type,
    isCorrect: gradeAnswer(question, byQuestion.get(question.id)?.value),
  }));
};

export default gradeAnswer;
