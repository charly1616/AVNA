import { createHmac } from "node:crypto";

import { ENV } from "../config/env.js";
import { resolveActivityCode } from "./activityLink.js";

/**
 * Every id and every order is derived from a secret, so the same activity
 * always produces the same questions. That way a question can be served by
 * code and number, and the answers still match the key of the attempt.
 *
 * The ids do not reveal the expected answer: they are hashes, and the
 * position of the correct option is only known by the server.
 */
const hash = (scope) => createHmac("sha256", ENV.activityLinkSecret).update(scope).digest();

const createId = (scope, prefix) => `${prefix}_${hash(scope).toString("base64url").slice(0, 12)}`;

const createSeed = (scope) => hash(scope).readUInt32BE(0);

const seededRandom = (seed) => {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffle = (items, scope) => {
  const random = seededRandom(createSeed(scope));
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
};

const toContent = (part) => ({
  text: part?.text ?? "",
  media: Array.isArray(part?.media) ? part.media : [],
});

const buildAbc = (question, scope) => {
  const options = question.options.map((option, index) => ({
    id: createId(`${scope}:opt:${index}`, "opt"),
    ...toContent(option),
  }));
  const correct = options[question.correctOption];

  return {
    options: shuffle(options, `${scope}:opt-order`),
    correct: { optionId: correct?.id ?? null },
  };
};

const buildSort = (question, scope) => {
  const items = question.items.map((item, index) => ({
    id: createId(`${scope}:itm:${index}`, "itm"),
    ...toContent(item),
  }));

  return {
    items: shuffle(items, `${scope}:itm-order`),
    correct: { order: items.map((item) => item.id) },
  };
};

const buildLines = (question, scope) => {
  const lefts = question.pairs.map((pair, index) => ({
    id: createId(`${scope}:lft:${index}`, "lft"),
    ...toContent(pair.left),
  }));
  const rights = question.pairs.map((pair, index) => ({
    id: createId(`${scope}:rgt:${index}`, "rgt"),
    ...toContent(pair.right),
  }));
  const matches = question.pairs.map((pair, index) => ({
    leftId: lefts[index].id,
    rightId: rights[index].id,
  }));

  return {
    lefts: shuffle(lefts, `${scope}:lft-order`),
    rights: shuffle(rights, `${scope}:rgt-order`),
    correct: { matches },
  };
};

const buildConcepts = (question) => {
  const cards = question.concepts.map((card) => ({
    id: card.id,
    title: card.title ?? "",
    question: toContent(card.question),
    media: Array.isArray(card.media) ? card.media : [],
  }));

  const answers = {};
  question.concepts.forEach((card) => {
    answers[card.id] = card.expectedAnswer?.text ?? "";
  });

  return {
    cards,
    correct: { answers },
  };
};

const builders = {
  abc: buildAbc,
  sort: buildSort,
  lines: buildLines,
  concepts: buildConcepts,
};

/**
 * The private snapshot of an activity: the questions as the student sees them
 * plus the answer key.
 */
export const buildQuizSnapshot = (activity) => {
  const code = resolveActivityCode(activity);

  const questions = [...(activity.questions ?? [])]
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
    .filter((question) => builders[question.type]);

  return questions.map((question, index) => ({
    id: question.id,
    number: index + 1,
    type: question.type,
    title: question.title ?? "",
    order: question.order ?? 0,
    media: Array.isArray(question.media) ? question.media : [],
    ...builders[question.type](question, `${code}:${question.id}`),
  }));
};

/**
 * The public version of a snapshot: the answer key is removed.
 */
export const toPublicQuestion = (question) => {
  const { correct, ...publicQuestion } = question;
  return publicQuestion;
};

export const toPublicQuestions = (questions) => questions.map(toPublicQuestion);

export default buildQuizSnapshot;
