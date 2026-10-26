import activityRepository from "../repositories/activity.repository.js";
import attemptRepository from "../repositories/attempt.repository.js";
import { resolveActivityCode } from "./activityLink.js";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const toPercent = (score, total) => (total > 0 ? Math.round((score / total) * 100) : 0);

const average = (values) =>
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

const round1 = (value) => Math.round(value * 10) / 10;

const openQuestionTypes = new Set(["concepts"]);

const sumTimeSpent = (attempt) =>
  (attempt.answers ?? []).reduce((sum, answer) => sum + (answer.timeSpentMs ?? 0), 0);

const distributionBuckets = [
  { label: "0-20%", min: 0, max: 20 },
  { label: "21-40%", min: 21, max: 40 },
  { label: "41-60%", min: 41, max: 60 },
  { label: "61-80%", min: 61, max: 80 },
  { label: "81-100%", min: 81, max: 100 },
];

const toActivityMeta = (activity) => ({
  id: activity._id?.toString(),
  title: activity.title,
  description: activity.description ?? "",
  code: resolveActivityCode(activity),
  color: activity.color,
  icon: activity.icon,
  totalQuestions: activity.questions?.length ?? 0,
});

const textById = (items, id) =>
  (items ?? []).find((item) => item.id === id)?.text ?? id;

const describeAnswer = (question, value) => {
  if (!value) return "";

  switch (question.type) {
    case "abc":
      return textById(question.options, value.optionId);

    case "sort":
      return (value.order ?? []).map((id) => textById(question.items, id)).join(" → ");

    case "lines":
      return (value.matches ?? [])
        .map(
          (match) =>
            `${textById(question.lefts, match.leftId)} → ${textById(question.rights, match.rightId)}`
        )
        .join("; ");

    case "concepts":
      return (value.cards ?? [])
        .map((card) => {
          const concept = (question.cards ?? []).find((item) => item.id === card.cardId);
          return `${concept?.title || concept?.id || "Concepto"}: ${card.text ?? ""}`;
        })
        .join(" | ");

    default:
      return typeof value === "string" ? value : JSON.stringify(value);
  }
};

const describeCorrectAnswer = (question) => {
  const correct = question.correct ?? {};

  switch (question.type) {
    case "abc":
      return textById(question.options, correct.optionId);

    case "sort":
      return (correct.order ?? []).map((id) => textById(question.items, id)).join(" → ");

    case "lines":
      return (correct.matches ?? [])
        .map(
          (match) =>
            `${textById(question.lefts, match.leftId)} → ${textById(question.rights, match.rightId)}`
        )
        .join("; ");

    case "concepts":
      return (question.cards ?? [])
        .map((card) => `${card.title || card.id}: ${correct.answers?.[card.id] ?? ""}`)
        .join(" | ");

    default:
      return "";
  }
};

const buildQuestionIndex = (attempts) => {
  const questions = new Map();

  attempts.forEach((attempt) => {
    (attempt.questions ?? []).forEach((question) => {
      if (!questions.has(question.id)) {
        questions.set(question.id, {
          id: question.id,
          number: question.number,
          title: question.title || `Pregunta ${question.number}`,
          type: question.type,
          expectedAnswer: describeCorrectAnswer(question),
        });
      }
    });
  });

  return [...questions.values()].sort((left, right) => left.number - right.number);
};

const buildPerQuestion = (questions, submittedAttempts) => {
  return questions.map((question) => {
    let answeredCount = 0;
    let correctCount = 0;
    let totalTimeMs = 0;

    submittedAttempts.forEach((attempt) => {
      const answer = (attempt.answers ?? []).find(
        (item) => item.questionId === question.id
      );

      if (!answer) return;

      answeredCount += 1;
      correctCount += answer.isCorrect ? 1 : 0;
      totalTimeMs += answer.timeSpentMs ?? 0;
    });

    return {
      ...question,
      answeredCount,
      correctCount,
      accuracy: answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0,
      averageTimeMs: answeredCount > 0 ? Math.round(totalTimeMs / answeredCount) : 0,
    };
  });
};

const buildPerType = (perQuestion) => {
  const types = new Map();

  perQuestion.forEach((question) => {
    const current = types.get(question.type) ?? {
      type: question.type,
      questions: 0,
      answeredCount: 0,
      correctCount: 0,
    };

    current.questions += 1;
    current.answeredCount += question.answeredCount;
    current.correctCount += question.correctCount;
    types.set(question.type, current);
  });

  return [...types.values()].map((type) => ({
    ...type,
    accuracy:
      type.answeredCount > 0
        ? Math.round((type.correctCount / type.answeredCount) * 100)
        : 0,
  }));
};

export const resultsService = {
  async getActivityResults(teacherId, activityId) {
    const activity = await activityRepository.findByIdForTeacher(activityId, teacherId);
    if (!activity) throw new HttpError(404, "Activity not found");

    const attempts = await attemptRepository.findByActivity(activityId);
    const submitted = attempts.filter((attempt) => attempt.status === "submitted");

    const percents = submitted.map((attempt) => toPercent(attempt.score, attempt.total));
    const durations = submitted.map(sumTimeSpent);

    const distribution = distributionBuckets.map((bucket) => ({
      ...bucket,
      count: percents.filter(
        (percent) => percent >= bucket.min && percent <= bucket.max
      ).length,
    }));

    const questions = buildQuestionIndex(submitted.length > 0 ? submitted : attempts);
    const perQuestion = buildPerQuestion(questions, submitted);

    return {
      activity: toActivityMeta(activity),
      generatedAt: new Date().toISOString(),
      summary: {
        totalAttempts: attempts.length,
        submittedAttempts: submitted.length,
        inProgressAttempts: attempts.length - submitted.length,
        averageScore: round1(average(submitted.map((attempt) => attempt.score))),
        averagePercent:
          submitted.length > 0 ? Math.round(average(percents)) : 0,
        passRate:
          submitted.length > 0
            ? Math.round(
                (percents.filter((percent) => percent >= 70).length / submitted.length) * 100
              )
            : 0,
        completionRate:
          attempts.length > 0
            ? Math.round((submitted.length / attempts.length) * 100)
            : 0,
        highestPercent: percents.length > 0 ? Math.max(...percents) : 0,
        lowestPercent: percents.length > 0 ? Math.min(...percents) : 0,
        averageDurationMs:
          durations.length > 0 ? Math.round(average(durations)) : 0,
        totalQuestions: questions.length,
      },
      distribution,
      perQuestion,
      perType: buildPerType(perQuestion),
      attempts: attempts.map((attempt) => ({
        id: attempt._id.toString(),
        studentName: attempt.studentName,
        studentEmail: attempt.studentEmail ?? "",
        score: attempt.score,
        total: attempt.total,
        percent: toPercent(attempt.score, attempt.total),
        status: attempt.status,
        submittedAt: attempt.submittedAt,
        createdAt: attempt.createdAt,
        durationMs: sumTimeSpent(attempt),
        answeredCount: attempt.answers?.length ?? 0,
      })),
    };
  },

  async updateAnswerCorrectness(
    teacherId,
    activityId,
    attemptId,
    questionId,
    isCorrect
  ) {
    const activity = await activityRepository.findByIdForTeacher(activityId, teacherId);
    if (!activity) throw new HttpError(404, "Activity not found");

    const attempt = await attemptRepository.findById(attemptId);
    if (!attempt || attempt.activity?.toString() !== activityId) {
      throw new HttpError(404, "Attempt not found");
    }

    const question = (attempt.questions ?? []).find((item) => item.id === questionId);
    if (!question) {
      throw new HttpError(404, "Question not found in this attempt");
    }

    if (!openQuestionTypes.has(question.type)) {
      throw new HttpError(400, "Only open questions can be corrected manually");
    }

    const answer = (attempt.answers ?? []).find(
      (item) => item.questionId === questionId
    );
    if (!answer) {
      throw new HttpError(400, "The student did not answer this question");
    }

    answer.isCorrect = isCorrect;
    attempt.score = (attempt.answers ?? []).filter((item) => item.isCorrect).length;
    attempt.total = (attempt.questions ?? []).length;

    await attemptRepository.save(attempt);

    return this.getAttemptResult(teacherId, activityId, attemptId);
  },

  async getAttemptResult(teacherId, activityId, attemptId) {
    const activity = await activityRepository.findByIdForTeacher(activityId, teacherId);
    if (!activity) throw new HttpError(404, "Activity not found");

    const attempt = await attemptRepository.findById(attemptId);
    if (!attempt || attempt.activity?.toString() !== activityId) {
      throw new HttpError(404, "Attempt not found");
    }

    const results = (attempt.questions ?? []).map((question) => {
      const answer = (attempt.answers ?? []).find(
        (item) => item.questionId === question.id
      );

      return {
        questionId: question.id,
        number: question.number,
        title: question.title || `Pregunta ${question.number}`,
        type: question.type,
        answered: Boolean(answer),
        isCorrect: answer?.isCorrect ?? false,
        timeSpentMs: answer?.timeSpentMs ?? 0,
        studentAnswer: describeAnswer(question, answer?.value),
        expectedAnswer: describeCorrectAnswer(question),
      };
    });

    return {
      activity: toActivityMeta(activity),
      attempt: {
        id: attempt._id.toString(),
        studentName: attempt.studentName,
        studentEmail: attempt.studentEmail ?? "",
        status: attempt.status,
        score: attempt.score,
        total: attempt.total,
        percent: toPercent(attempt.score, attempt.total),
        submittedAt: attempt.submittedAt,
        createdAt: attempt.createdAt,
        durationMs: sumTimeSpent(attempt),
      },
      results,
    };
  },
};

export default resultsService;
