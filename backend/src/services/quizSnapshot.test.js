import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildQuizSnapshot, toPublicQuestion, toPublicQuestions } from "./quizSnapshot.js";

const activity = {
  title: "Actividad de prueba",
  link: "https://quiz.example/a/actividad-de-prueba",
  questions: [
    {
      id: "q2",
      type: "abc",
      title: "Segunda",
      order: 1,
      options: [{ text: "A" }, { text: "B" }],
      correctOption: 1,
    },
    {
      id: "q1",
      type: "abc",
      title: "Primera",
      order: 0,
      options: [{ text: "X" }, { text: "Y" }, { text: "Z" }],
      correctOption: 2,
    },
  ],
};

describe("buildQuizSnapshot", () => {
  it("numbers the questions following their order", () => {
    const snapshot = buildQuizSnapshot(activity);

    assert.equal(snapshot.length, 2);
    assert.equal(snapshot[0].id, "q1");
    assert.equal(snapshot[0].number, 1);
    assert.equal(snapshot[1].id, "q2");
    assert.equal(snapshot[1].number, 2);
  });

  it("is stable: the same activity always produces the same questions", () => {
    const first = buildQuizSnapshot(activity);
    const second = buildQuizSnapshot(activity);

    assert.deepEqual(
      first.map((question) => question.options.map((option) => option.id)),
      second.map((question) => question.options.map((option) => option.id))
    );
    assert.deepEqual(
      first.map((question) => question.correct.optionId),
      second.map((question) => question.correct.optionId)
    );
  });

  it("keeps the correct option among the options, but never in the payload", () => {
    const [question] = buildQuizSnapshot(activity);
    const optionIds = question.options.map((option) => option.id);

    assert.ok(optionIds.includes(question.correct.optionId));
    assert.equal("correct" in toPublicQuestion(question), false);
  });
});

describe("toPublicQuestions", () => {
  it("removes the answer key from every question", () => {
    const publicQuestions = toPublicQuestions(buildQuizSnapshot(activity));

    assert.equal(publicQuestions.length, 2);
    publicQuestions.forEach((question) => {
      assert.equal("correct" in question, false);
    });
  });
});
