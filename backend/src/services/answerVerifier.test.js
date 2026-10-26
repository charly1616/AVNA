import assert from "node:assert/strict";
import test from "node:test";

import { verifyAnswer } from "./answerVerifier.service.js";

test("verifyAnswer", async (t) => {
  await t.test("accepts an exact answer without calling Gemini", async () => {
    const verdict = await verifyAnswer({
      question: "¿Qué es la fotosíntesis?",
      expectedAnswer: "El proceso por el que las plantas producen alimento",
      answer: "  el PROCESO por el que las plantas   producen alimento ",
    });

    assert.equal(verdict.correct, true);
    assert.equal(verdict.confidence, 1);
  });

  await t.test("ignores accents and punctuation in exact matches", async () => {
    const verdict = await verifyAnswer({
      question: "¿Cuál es la capital de Francia?",
      expectedAnswer: "París",
      answer: "PARIS.",
    });

    assert.equal(verdict.correct, true);
    assert.equal(verdict.confidence, 1);
  });
});
