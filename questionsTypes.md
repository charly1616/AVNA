# Question Types

The portal currently supports four question types, defined in the backend as
`abc`, `sort`, `lines`, and `concepts`
(`backend/src/models/activity.model.js:68`). Teachers create them in the
activity editor (`frontend/src/components/manage/ActivityQuestionCard.jsx`) and
students answer them in the public quiz app
(`frontend-quiz/src/components/questions/`).

Every question has an `id`, `type`, `title`, `order`, optional `media`, and the
type-specific fields listed below. Answers are always graded on the server
(`backend/src/services/quizGrading.js`); the browser never receives the answer
key. The server also builds stable, hashed option/item ids and shuffles options,
sort items, and matching columns per activity and question
(`backend/src/services/quizSnapshot.js`).

| Type | Teacher label | Student interaction | Fields |
|---|---|---|---|
| `abc` | Selección ABCD | Pick one option | `options`, `correctOption` |
| `sort` | Ordenar elementos | Reorder a list | `items` |
| `lines` | Unir con líneas | Match left items to right items | `pairs` |
| `concepts` | Tarjetas sorpresa | Type an answer for each card | `concepts` |

---

## 1. `abc` — Multiple Choice (Selección ABCD)

**How it works:** The teacher writes at least two options and marks exactly one
as correct. Students see the options in a shuffled order (labelled A, B, C, D,
and so on) and select a single answer. Media is supported on options.

**Authoring rules:** At least 2 options; `correctOption` must be a valid index.
Options are stored as a list; the per-question validation enforces the minimum
and the correct-answer index.

**Grading:** The submitted `optionId` must equal the hashed id of the correct
option.

**Skills tested:**
- **Recall and recognition** of facts, definitions, and vocabulary.
- **Comprehension** — choosing the best interpretation among plausible
  distractors.
- **Discrimination** — telling apart similar concepts or common misconceptions.
- **Decision making under a single-best-answer format.**

**Best for:** Quick knowledge checks, concept identification, and formative
assessment where exactly one answer is right.

---

## 2. `sort` — Ordering (Ordenar elementos)

**How it works:** The teacher enters at least two items in the correct order.
Students receive the items shuffled and move them up or down until the sequence
matches. The original teacher order is the answer key.

**Authoring rules:** At least 2 items.

**Grading:** The submitted `order` array must match the expected order exactly,
including every item and its position.

**Skills tested:**
- **Sequencing** — placing steps, events, or stages in the correct order.
- **Understanding processes and causality** — knowing what must happen before
  what.
- **Logical reasoning and structure** — recognizing the internal logic of a
  procedure, timeline, or hierarchy.
- **Attention to detail**, since a single misplaced item makes the answer wrong.

**Best for:** Algorithms, historical timelines, lifecycle stages, procedures,
and ranking tasks.

---

## 3. `lines` — Matching (Unir con líneas)

**How it works:** The teacher defines at least two left/right pairs. Students
match each left item to a right item using a selector. Both columns are shuffled
independently so the positional order does not reveal the answer. Media is
supported on both sides.

**Authoring rules:** At least 2 pairs. Each pair has a `left` and a `right`
content part.

**Grading:** Every left item must be mapped to its correct right item; missing or
additional/wrong matches fail the question.

**Skills tested:**
- **Association and relationship recognition** — linking terms to definitions,
  causes to effects, symbols to meanings, or examples to categories.
- **Comprehension of connections** between two sets of concepts.
- **Classification and comparison.**
- **Recall with contextual clues**, since items are presented out of order.

**Best for:** Vocabulary-to-definition, country-to-capital, formula-to-name,
event-to-date, and similar paired-knowledge tasks.

---

## 4. `concepts` — Open Answer Cards / Surprise Cards (Tarjetas sorpresa)

**How it works:** The teacher creates between two and four concept cards. Each
card has a unique `id`, a short `title` (the concept name), a `question` prompt,
and an `expectedAnswer`. Students see the cards and type a free-text response
for each one; media is supported on cards.

**Authoring rules:** Between 2 and 4 cards per question, and card ids must be
unique within the question.

**Grading:** Each answer is compared to its expected answer after normalizing
case, surrounding whitespace, and repeated internal spaces. All cards must match
for the question to be correct. If a card's expected answer is empty, that card
is treated as self-evaluated and automatically passes.

**Skills tested:**
- **Open recall and production** — generating an answer instead of recognizing
  one.
- **Explanation and articulation** of concepts in the student's own words.
- **Depth of understanding** of multiple related concepts in one item.
- **Written expression and precision**, because grading is text-based.

**Best for:** Definition recall, short explanations, and checking understanding
of several linked concepts within a single question.

---

## Summary of Skills

| Type | Primary skill | Secondary skills |
|---|---|---|
| `abc` | Recognition / recall | Comprehension, discrimination, decision making |
| `sort` | Sequencing | Process understanding, causality, logical structure |
| `lines` | Association | Classification, comparison, relationship recognition |
| `concepts` | Open recall / production | Explanation, articulation, written precision |

The four types progress from **recognition** (`abc`) and **structured reasoning**
(`sort`, `lines`) to **free production** (`concepts`), so a single activity can
mix lower- and higher-order thinking tasks.

## Adding a New Type

A new type must be added in four places:

1. `backend/src/models/activity.model.js` — enum, schema fields, and validation.
2. `backend/src/services/quizSnapshot.js` — a builder that produces the public
   question shape and the private `correct` key.
3. `backend/src/services/quizGrading.js` — a grading case for the new type.
4. `frontend/src/components/manage/ActivityQuestionCard.jsx` (editor) and
   `frontend-quiz/src/components/questions/` (student UI), plus the label in
   `frontend/src/components/manage/ActivityQuestionsSection.jsx`.
