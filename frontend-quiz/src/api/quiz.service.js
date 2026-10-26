import { api } from "./client";

const attemptHeaders = (token) => ({ "x-attempt-token": token });

export const quizService = {
  async registerStudent(name) {
    const { data } = await api.post("/public/students", { name });
    return data.student;
  },

  async getStudent(token) {
    const { data } = await api.get("/public/students/me", {
      headers: { "x-student-token": token },
    });
    return data.student;
  },

  async getActivity(slug) {
    const { data } = await api.get(`/public/activities/${encodeURIComponent(slug)}`);
    return data.activity;
  },

  async getQuestions(slug) {
    const { data } = await api.get(`/public/activities/${encodeURIComponent(slug)}/questions`);
    return data;
  },

  async getQuestion(slug, number) {
    const { data } = await api.get(
      `/public/activities/${encodeURIComponent(slug)}/questions/${number}`
    );
    return data;
  },

  async startAttempt(slug, { studentName, studentEmail, studentToken }) {
    const { data } = await api.post(`/public/activities/${encodeURIComponent(slug)}/attempts`, {
      studentName,
      studentEmail,
      studentToken,
    });
    return data.attempt;
  },

  async logAnswer(attemptId, token, answer) {
    const { data } = await api.put(
      `/public/attempts/${attemptId}/answers`,
      answer,
      { headers: attemptHeaders(token) }
    );
    return data;
  },

  async submitAttempt(attemptId, token) {
    const { data } = await api.post(
      `/public/attempts/${attemptId}/submit`,
      {},
      { headers: attemptHeaders(token) }
    );
    return data.result;
  },

  async checkAnswer(slug, { questionId, cardId, answer }) {
    const { data } = await api.post(
      `/public/activities/${encodeURIComponent(slug)}/answers/check`,
      { questionId, cardId, answer }
    );
    return data.result;
  },
};

export default quizService;
