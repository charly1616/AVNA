import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { gradeAll, gradeAnswer, normalizeText } from "./quizGrading.js";

const abcQuestion = {
  id: "q1",
  type: "abc",
  correct: { optionId: "opt_1" },
};

const sortQuestion = {
  id: "q2",
  type: "sort",
  correct: { order: ["itm_1", "itm_2", "itm_3"] },
};

const linesQuestion = {
  id: "q3",
  type: "lines",
  correct: {
    matches: [
      { leftId: "lft_1", rightId: "rgt_2" },
      { leftId: "lft_2", rightId: "rgt_1" },
    ],
  },
};

const conceptsQuestion = {
  id: "q4",
  type: "concepts",
  cards: [{ id: "c1" }, { id: "c2" }],
  correct: { answers: { c1: "Es un bloque", c2: "" } },
};

describe("normalizeText", () => {
  it("ignores case, extra spaces and surrounding blanks", () => {
    assert.equal(normalizeText("  Hola   MUNDO "), "hola mundo");
  });
});

describe("gradeAnswer", () => {
  it("grades multiple choice questions", () => {
    assert.equal(gradeAnswer(abcQuestion, { optionId: "opt_1" }), true);
    assert.equal(gradeAnswer(abcQuestion, { optionId: "opt_2" }), false);
    assert.equal(gradeAnswer(abcQuestion, {}), false);
  });

  it("grades ordering questions", () => {
    assert.equal(gradeAnswer(sortQuestion, { order: ["itm_1", "itm_2", "itm_3"] }), true);
    assert.equal(gradeAnswer(sortQuestion, { order: ["itm_2", "itm_1", "itm_3"] }), false);
    assert.equal(gradeAnswer(sortQuestion, { order: ["itm_1", "itm_2"] }), false);
  });

  it("grades matching questions", () => {
    assert.equal(
      gradeAnswer(linesQuestion, {
        matches: [
          { leftId: "lft_1", rightId: "rgt_2" },
          { leftId: "lft_2", rightId: "rgt_1" },
        ],
      }),
      true
    );
    assert.equal(
      gradeAnswer(linesQuestion, {
        matches: [
          { leftId: "lft_1", rightId: "rgt_1" },
          { leftId: "lft_2", rightId: "rgt_2" },
        ],
      }),
      false
    );
  });

  it("grades concept cards and accepts any answer for self evaluated cards", () => {
    assert.equal(
      gradeAnswer(conceptsQuestion, {
        cards: [
          { cardId: "c1", text: "es un bloque" },
          { cardId: "c2", text: "cualquier cosa" },
        ],
      }),
      true
    );
    assert.equal(
      gradeAnswer(conceptsQuestion, {
        cards: [
          { cardId: "c1", text: "otra cosa" },
          { cardId: "c2", text: "cualquier cosa" },
        ],
      }),
      false
    );
  });
});

describe("gradeAll", () => {
  it("grades every question and treats unanswered questions as wrong", () => {
    const results = gradeAll([abcQuestion, sortQuestion], [
      { questionId: "q1", value: { optionId: "opt_1" } },
    ]);

    assert.deepEqual(results, [
      { questionId: "q1", type: "abc", isCorrect: true },
      { questionId: "q2", type: "sort", isCorrect: false },
    ]);
  });
});
