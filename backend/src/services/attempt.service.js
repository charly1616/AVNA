import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import activityRepository from "../repositories/activity.repository.js";
import attemptRepository from "../repositories/attempt.repository.js";
import { resolveActivityCode } from "./activityLink.js";
import studentService from "./student.service.js";
import { buildQuizSnapshot, toPublicQuestion, toPublicQuestions } from "./quizSnapshot.js";
import { gradeAll, gradeAnswer } from "./quizGrading.js";
import { verifyAnswer } from "./answerVerifier.service.js";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const hashToken = (token) => createHash("sha256").update(String(token)).digest("hex");

const isValidToken = (attempt, token) => {
  if (!token) return false;

  const provided = Buffer.from(hashToken(token));
  const stored = Buffer.from(attempt.tokenHash);

  return provided.length === stored.length && timingSafeEqual(provided, stored);
};

const toPercent = (score, total) => (total === 0 ? 0 : Math.round((score / total) * 100));

const toActivityMeta = (activity) => ({
  id: activity._id?.toString(),
  title: activity.title,
  description: activity.description ?? "",
  color: activity.color,
  icon: activity.icon,
  active: activity.active !== false,
});

const getAuthorizedAttempt = async (attemptId, token) => {
  const attempt = await attemptRepository.findById(attemptId);
  if (!attempt || !isValidToken(attempt, token)) {
    throw new HttpError(404, "Attempt not found");
  }

  return attempt;
};

const buildResult = (attempt) => {
  const results = gradeAll(attempt.questions, attempt.answers);
  const score = results.filter((result) => result.isCorrect).length;

  return {
    score,
    total: attempt.questions.length,
    percent: toPercent(score, attempt.questions.length),
    studentName: attempt.studentName,
    results,
  };
};

export const attemptService = {
    /**
   * The activity behind a code, ready to be played.
   *
   * An activity that the teacher marked as inactive is still opened: the quiz
   * app shows a notice instead of blocking the exam, so no activity ever
   * becomes unreachable.
   */
  async getActivityDocument(code) {
    const activity = await activityRepository.findByPublicCode(code);
    if (!activity) throw new HttpError(404, "Actividad no encontrada");

    const questions = buildQuizSnapshot(activity);
    if (questions.length === 0) throw new HttpError(404, "Esta actividad todavía no tiene preguntas");

    return { activity, questions };
  }
,

  /**
   * The activity of a code, ready to be played.
   */
  async getActivity(code) {
    const { activity, questions } = await this.getActivityDocument(code);

    return {
      code: resolveActivityCode(activity),
      ...toActivityMeta(activity),
      totalQuestions: questions.length,
    };
  },

  /**
   * Every question of an activity, without the answer key.
   */
  async getQuestions(code) {
    const { questions } = await this.getActivityDocument(code);

    return {
      code,
      totalQuestions: questions.length,
      questions: toPublicQuestions(questions),
    };
  },

  /**
   * A single question, addressed by its number (1 based).
   */
  async getQuestion(code, number) {
    const { questions } = await this.getActivityDocument(code);
    const question = questions[number - 1];

    if (!question) {
      throw new HttpError(404, `La actividad solo tiene ${questions.length} preguntas`);
    }

    return {
      code,
      number: question.number,
      totalQuestions: questions.length,
      question: toPublicQuestion(question),
    };
  },

  async start(code, { studentName, studentEmail, studentToken }) {
    const { activity, questions } = await this.getActivityDocument(code);

    /**
     * A student that registered by name starts the attempt with their token,
     * so all their attempts are gathered under the same student.
     */
    let student = null;
    if (studentToken) {
      student = await studentService.getByToken(studentToken);
      if (!student) {
        throw new HttpError(401, "Tu registro no es válido, escribe tu nombre de nuevo");
      }
    }

    const name = student?.name ?? studentName;
    if (!name) throw new HttpError(400, "Your name is required");

    const token = randomBytes(24).toString("hex");

    const attempt = await attemptRepository.create({
      activity: activity._id,
      activityCode: resolveActivityCode(activity),
      activityTitle: activity.title,
      student: student?._id ?? null,
      studentName: name,
      studentEmail: studentEmail ?? "",
      tokenHash: hashToken(token),
      status: "in_progress",
      questions,
      answers: [],
      score: 0,
      total: questions.length,
    });

    return {
      id: attempt._id.toString(),
      token,
      startedAt: attempt.createdAt,
      totalQuestions: questions.length,
      activity: toActivityMeta(activity),
      questions: toPublicQuestions(questions),
    };
  },

  async logAnswer(attemptId, token, { questionNumber, questionId, type, value, timeSpentMs }) {
    const attempt = await getAuthorizedAttempt(attemptId, token);

    if (attempt.status === "submitted") {
      throw new HttpError(409, "This attempt was already submitted");
    }

    const question = this.findQuestion(attempt, { questionNumber, questionId });
    if (!question) throw new HttpError(404, "Question not found in this activity");
    if (question.type !== type) throw new HttpError(400, "The answer does not match the question type");

    const isCorrect = gradeAnswer(question, value);

    const existing = attempt.answers.find((answer) => answer.questionId === question.id);
    if (existing) {
      existing.value = value;
      existing.isCorrect = isCorrect;
      existing.timeSpentMs = timeSpentMs ?? existing.timeSpentMs;
      existing.answeredAt = new Date();
    } else {
      attempt.answers.push({
        questionId: question.id,
        questionNumber: question.number,
        type,
        value,
        isCorrect,
        timeSpentMs: timeSpentMs ?? 0,
        answeredAt: new Date(),
      });
    }

    await attemptRepository.save(attempt);

    return {
      saved: true,
      answeredCount: attempt.answers.length,
      totalQuestions: attempt.total,
    };
  },

  async submit(attemptId, token) {
    const attempt = await getAuthorizedAttempt(attemptId, token);

    if (attempt.status === "submitted") {
      return buildResult(attempt);
    }

    const results = gradeAll(attempt.questions, attempt.answers);
    const score = results.filter((result) => result.isCorrect).length;

    attempt.status = "submitted";
    attempt.score = score;
    attempt.total = attempt.questions.length;
    attempt.submittedAt = new Date();

    await attemptRepository.save(attempt);

    return buildResult(attempt);
  },

  async getAttempt(attemptId, token) {
    const attempt = await getAuthorizedAttempt(attemptId, token);

    return {
      id: attempt._id.toString(),
      status: attempt.status,
      studentName: attempt.studentName,
      activity: {
        id: attempt.activity?.toString(),
        title: attempt.activityTitle,
        code: attempt.activityCode,
      },
      totalQuestions: attempt.total,
      answeredCount: attempt.answers.length,
      score: attempt.score,
      percent: toPercent(attempt.score, attempt.total),
      submittedAt: attempt.submittedAt,
      answers: attempt.answers.map((answer) => ({
        questionId: answer.questionId,
        questionNumber: answer.questionNumber,
        type: answer.type,
        isCorrect: answer.isCorrect,
        answeredAt: answer.answeredAt,
      })),
    };
  },

  /**
   * A question can be addressed by its number or by its id.
   */
  findQuestion(attempt, { questionNumber, questionId }) {
    if (questionNumber !== undefined && questionNumber !== null) {
      return attempt.questions[questionNumber - 1] ?? null;
    }

    return attempt.questions.find((question) => question.id === questionId) ?? null;
  },

  /**
   * Checks a free-text answer against the expected answer stored in the
   * database, using the external answer-equivalence service. Only "concepts"
   * questions have free text; the other types are graded deterministically.
   */
  async checkAnswer(code, { questionId, cardId, answer }) {
    const { questions } = await this.getActivityDocument(code);
    const question = questions.find((item) => item.id === questionId);

    if (!question) throw new HttpError(404, "Question not found in this activity");

    if (question.type !== "concepts") {
      throw new HttpError(400, "Only concept answers can be checked with this endpoint");
    }

    const cards = question.cards ?? [];
    const card = cardId
      ? cards.find((item) => item.id === cardId)
      : cards.length === 1
        ? cards[0]
        : null;

    if (!card) {
      throw new HttpError(
        400,
        cardId ? "Concept card not found in this question" : "Indicate the concept card id"
      );
    }

    const expectedAnswer = question.correct?.answers?.[card.id] ?? "";

    if (!expectedAnswer.trim()) {
      return {
        questionId,
        cardId: card.id,
        correct: true,
        confidence: null,
        expectedAnswer: "",
        verifiedBy: "self",
      };
    }

    const verdict = await verifyAnswer({
      question: card.question?.text || card.title || question.title || "Respuesta",
      expectedAnswer,
      answer,
    });

    return {
      questionId,
      cardId: card.id,
      correct: verdict.correct,
      confidence: verdict.confidence,
      verifiedBy: "model",
    };
  },
};

export default attemptService;
