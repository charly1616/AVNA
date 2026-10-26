# Results Analysis — Graphable Insights for Teachers

This document lists, one by one, the insights that can be graphed from the quiz data
already stored by the backend, plus the ones that need a small addition. Each insight
states **what it answers**, the **recommended chart**, **where the data comes from**, and
**how a teacher should read it**.

The natural place for these graphs is the **"Ver resultados"** action on the home page
(`frontend/src/pages/HomePage.jsx`), which today has no route yet.

---

## 1. Data available today

| Source | Fields | Use for graphs |
|---|---|---|
| `Attempt` | `activity`, `activityCode`, `activityTitle`, `student`, `studentName`, `studentEmail` | grouping, filtering, identity |
| `Attempt` | `status` (`in_progress` / `submitted`), `score`, `total` | completion and performance |
| `Attempt` | `createdAt`, `updatedAt`, `submittedAt` | participation over time, duration |
| `Attempt.questions` | full question snapshot **including the answer key**, `id`, `number`, `type`, `order`, `title` | per-question analytics, stable even if the activity is edited later |
| `Attempt.answers` | `questionId`, `questionNumber`, `type`, `value`, `isCorrect`, `timeSpentMs`, `answeredAt` | correctness, chosen answers, timing |
| `Student` | `name`, `nameKey`, `createdAt`, `tokenHashes` | unique students, returning students |
| `Activity` | `title`, `description`, `color`, `icon`, `code`, `active`, `questions` | activity metadata, authoring diagnostics |
| Grading | `quizGrading.js` — exact `optionId`, exact order, exact matches, normalized text for concepts | interpretation caveats |

Two grading facts matter for every chart:

- An **abc** answer is correct only by exact `optionId`; a **sort** answer only by exact
  order; **lines** only by an exact complete matching.
- A **concepts** card with an empty `expectedAnswer` is always counted as correct
  (self-evaluated). Cards with an expected answer are compared as normalized text
  (trim, lowercase, collapse spaces), so synonyms count as wrong.

---

## 2. Participation and reach

### 2.1 Attempts started over time
- **Question it answers:** How many students are using each activity, and is use growing?
- **Chart:** line or area chart, one series per activity, x = day/week, y = attempts.
- **Data:** `count(Attempt)` grouped by `createdAt` date, optionally grouped by `activity`.
- **Read it:** a spike after class, a flat line after an exam date, or an activity that was
  never opened. Compare with the class calendar. **Available now.**

### 2.2 Completion funnel (started → answered → submitted)
- **Question it answers:** How many students finish what they start?
- **Chart:** funnel (or stacked bar): started, answered at least one question, answered all,
  submitted.
- **Data:** `status`, `answers.length` vs `questions.length`.
- **Read it:** a big gap between "answered all" and "submitted" points to a confusing
  final step or a bug, not to the students. **Available now.**

### 2.3 Completion rate per activity
- **Question it answers:** Which exam is abandoned the most?
- **Chart:** horizontal bar, sorted, `submitted / started * 100`.
- **Data:** `status` grouped by `activity`.
- **Read it:** low completion in a long activity suggests it is too long or too hard.
  **Available now.**

### 2.4 Unique students vs. total attempts
- **Question it answers:** Are the numbers inflated by retakes?
- **Chart:** grouped bar per activity (unique students, attempts) or a KPI card pair.
- **Data:** `distinct student` (fallback `studentName` when `student` is null) vs `count`.
- **Read it:** 30 attempts from 12 students means most people repeated the exam; decide
  which policy to show first (latest attempt, best attempt, all attempts).
  **Available now.**

### 2.5 First-time vs. returning students
- **Question it answers:** Are students coming back to practise?
- **Chart:** stacked area or line: new students per week vs returning students per week.
- **Data:** `Student.createdAt` (first appearance) vs attempts from that student later.
- **Read it:** useful to see whether an activity becomes a study habit or a one-off.
  **Available now.**

### 2.6 Participation by weekday and hour
- **Question it answers:** When do students actually take the quizzes?
- **Chart:** heatmap, x = hour of day, y = weekday, color = attempts.
- **Data:** `createdAt` of attempts.
- **Read it:** schedule the release of an exam right before the busiest slot.
  **Available now.**

---

## 3. Scores and outcomes

### 3.1 Score distribution per activity
- **Question it answers:** Is the exam too easy, too hard, or well calibrated?
- **Chart:** histogram per activity, bins 0–20, 21–40, 41–60, 61–80, 81–100 (%).
- **Data:** `round(score / total * 100)` for submitted attempts.
- **Read it:** a symmetric bell around 60–70 means a fair exam; everything above 90 means
  too easy; a second bump at the bottom means a group is being left behind.
  **Available now.**

### 3.2 Average, median and pass rate
- **Question it answers:** What is the headline result of the activity?
- **Chart:** KPI cards (three numbers) plus a small bar per activity for comparison.
- **Data:** mean/median of `score / total`, pass rate with a configurable threshold
  (default 60%).
- **Read it:** the median is more honest than the mean with few attempts; show both.
  **Available now.**

### 3.3 Grade bands
- **Question it answers:** How many students fall into each grade bracket?
- **Chart:** donut or 100% stacked bar with configurable cut-offs (e.g. A ≥ 90, B ≥ 80,
  C ≥ 70, D ≥ 60, F < 60).
- **Data:** `score / total`.
- **Read it:** the shape of the bands is easier to communicate to a class than a raw mean.
  **Available now.**

### 3.4 Score by attempt number (learning curve)
- **Question it answers:** Do students improve when they retry?
- **Chart:** line, x = attempt number (1st, 2nd, 3rd...), y = average score. One line per
  activity or per student.
- **Data:** attempts ordered by `createdAt` per `student`.
- **Read it:** an upward slope means the activity works as practice; a flat or falling
  slope means repeating does not help (or the answers were shared).
  **Available now.**

### 3.5 Best vs. latest score per student
- **Question it answers:** Did the student consolidate the improvement or was it luck?
- **Chart:** scatter (x = latest, y = best) with a diagonal reference line, or a slope
  chart (first → latest).
- **Data:** per student, `score` of the first/last/best attempt.
- **Read it:** points above the diagonal repeated their best result; points far below
  peaked once and then dropped. **Available now.**

### 3.6 Score vs. time to complete
- **Question it answers:** Do fast students score better, or do they rush?
- **Chart:** scatter, x = `submittedAt - createdAt`, y = score %, with a trend line.
- **Data:** timestamps of submitted attempts.
- **Read it:** a cluster of low scores at very short durations is a rush signal; low scores
  at very long durations is a difficulty signal. **Available now.**

### 3.7 Activity comparison
- **Question it answers:** Which of my exams produces the best results?
- **Chart:** grouped/ordered bar or a radar with axes = activity, value = average score.
- **Data:** average score per `activity`.
- **Read it:** compare only activities taken by the same group, otherwise it compares
  cohorts. **Available now.**

---

## 4. Per-question diagnostics (item analysis)

### 4.1 Correct rate per question
- **Question it answers:** Which questions are the hardest?
- **Chart:** horizontal bar sorted ascending, one bar per question, with the question
  title as the label. Color by question type.
- **Data:** `answers` where `questionId` matches the snapshot question, `isCorrect`.
- **Read it:** the first bars are the content to re-teach. Note both rates: **over
  attempts** (blanks count as wrong) and **over answers** (only students who answered).
  **Available now.**

### 4.2 Difficulty vs. discrimination (item quality)
- **Question it answers:** Is a question failing because it is hard, or because it is
  badly written (it does not separate good from weak students)?
- **Chart:** scatter, x = difficulty (proportion correct), y = discrimination
  (`p_top27% - p_bottom27%`), with a reference band. Label the outliers.
- **Data:** per question, attempts grouped by total score; compare the top 27% and the
  bottom 27% of attempts.
- **Read it:** very easy questions are noise; questions with near-zero discrimination
  usually have an ambiguous statement or two valid answers. **Available now** (small N
  makes the index noisy; show the attempt count).

### 4.3 Performance by question type
- **Question it answers:** Do students struggle more with ordering, matching, multiple
  choice or open answers?
- **Chart:** grouped bar or radar: abc / sort / lines / concepts.
- **Data:** `answers.type` vs `isCorrect`, or the snapshot `question.type`.
- **Read it:** a consistently weak type is a teaching/format problem, not a content
  problem. **Available now.**

### 4.4 Answer option distribution (abc)
- **Question it answers:** Are the distractors plausible? Is one option never chosen?
- **Chart:** 100% stacked bar per question, one segment per option, the correct option
  highlighted, plus a "no answer" segment.
- **Data:** `answers.value.optionId` for `type = abc`, mapped to the snapshot options.
- **Read it:** a distractor chosen by nobody is dead weight; an incorrect option chosen
  more than the correct one is a red flag for a misleading statement.
  **Available now** (option ids are deterministic per activity code + question id).

### 4.5 Distractor "magnet" ranking
- **Question it answers:** Which wrong answer attracts the most students, and why?
- **Chart:** ranked table or bar list of the top wrong options with counts and the option
  text.
- **Data:** same as 4.4, filtered to incorrect choices.
- **Read it:** each top distractor is a misconception to discuss in class.
  **Available now.**

### 4.6 Matching confusion matrix (lines)
- **Question it answers:** Which pairs do students mix up?
- **Chart:** heatmap, rows = left items, columns = right items, cell = times that pair was
  submitted; diagonal = correct pairs.
- **Data:** `answers.value.matches` for `type = lines`, resolved through the snapshot.
- **Read it:** strong off-diagonal cells reveal confusable concepts; a whole empty row
  means the left item was never understood. **Available now.**

### 4.7 Ordering diagnostics (sort)
- **Question it answers:** Which items are placed in the wrong position, and how far off?
- **Chart:** heatmap of item vs. submitted position, or a bar of average displacement
  per item; optionally the most frequent wrong order as a small list.
- **Data:** `answers.value.order` vs `snapshot.correct.order`.
- **Read it:** items always placed at the extremes are understood; the middle of the
  sequence is where the misconception lives. **Available now.**

### 4.8 Open answers (concepts)
- **Question it answers:** Which concept cards are left blank or answered poorly?
- **Chart:** stacked bar per card: correct / incorrect / blank, plus a distribution of
  answer length (words) and a sample of the most common answers.
- **Data:** `answers.value.cards[].text`, `isCorrect`, and the snapshot `correct.answers`.
- **Read it:** a blank rate is a comprehension signal; a high incorrect rate with good
  answers is a **grading** signal (synonyms are currently marked wrong because the
  comparison is exact after normalization). Expect to add a manual review for these.
  **Available now, with grading caveat.**

### 4.9 Unanswered rate per question
- **Question it answers:** Where do students give up or run out of time?
- **Chart:** bar per question (percentage of attempts with no answer for that question).
- **Data:** attempts' snapshot questions minus the answered `questionId`s.
- **Read it:** an unanswered spike at the end is pacing; a spike in the middle is a
  confusing question. **Available now.**

---

## 5. Progress inside the test

### 5.1 Correct rate by question position
- **Question it answers:** Is there a warm-up or a fatigue effect?
- **Chart:** line, x = question number, y = correct rate, with the number of attempts as
  a secondary axis/thin bar.
- **Data:** `answers.questionNumber` vs `isCorrect` (or snapshot order).
- **Read it:** a falling line suggests the exam is too long; a rising line suggests the
  first questions are the hardest. **Available now.**

### 5.2 Time per question
- **Question it answers:** Which questions consume the most time?
- **Chart:** bar per question (average and median), with a box plot for the spread.
- **Data:** `answers.timeSpentMs`.
- **Read it:** high time + low correctness = a hard or badly worded question; high time +
  high correctness = a rich question worth keeping. **Needs a small change:** the quiz
  app does not send `timeSpentMs` yet (it is already accepted by the API validator, so
  only the client must start measuring it). Until then this is always 0.

### 5.3 Pacing timeline per attempt
- **Question it answers:** Did the student rush, stall, or run out of time?
- **Chart:** step/line, x = question number, y = elapsed time; one line per attempt (or
  the average with a shaded p25–p75 band).
- **Data:** differences of consecutive `answers.answeredAt` timestamps.
- **Read it:** a long flat segment is a stall; a vertical jump at the end is a rush.
  **Available now** (it includes reading time between questions, unlike `timeSpentMs`).

### 5.4 Drop-off point
- **Question it answers:** Where exactly do students abandon the exam?
- **Chart:** bar, x = question number, y = number of attempts whose last answer was that
  question (only `in_progress` attempts).
- **Data:** max `questionNumber` in `answers` for non-submitted attempts.
- **Read it:** move or simplify the question right after the drop-off peak.
  **Available now.**

### 5.5 Attempt duration distribution
- **Question it answers:** How long does the exam really take?
- **Chart:** histogram of `submittedAt - createdAt`, with the questions count in the
  caption.
- **Data:** attempt timestamps.
- **Read it:** use the p90 (not the average) to size a future time limit.
  **Available now.**

---

## 6. Student-level insights

### 6.1 Student leaderboard
- **Question it answers:** Who is at the top, and with how many attempts?
- **Chart:** table with an inline bar (best score, attempts, last activity date).
- **Data:** per student: max/last score, attempt count, last `createdAt`.
- **Read it:** always show the attempt count next to the score; otherwise a student who
  retried five times outranks one who scored well once. **Available now.**

### 6.2 Student progress across activities
- **Question it answers:** Is a student improving across the term?
- **Chart:** multi-line, x = date, y = score %, one line per student (highlight one).
- **Data:** submitted attempts ordered by `createdAt`, grouped by `student`.
- **Read it:** a flat line across different topics means a general skill gap, not a
  topic gap. **Available now.**

### 6.3 At-risk students
- **Question it answers:** Who needs help now?
- **Chart:** scatter (x = attempts, y = best score) with a highlighted quadrant, or a
  filtered table.
- **Data:** low best score, several attempts, last attempt long ago.
- **Read it:** turns the dashboard from "how did the class do" into "who do I talk to".
  **Available now.**

### 6.4 Student answer detail
- **Question it answers:** What exactly did this student answer?
- **Chart:** not a chart — a per-student drill-down panel (question, submitted answer,
  correct answer, time) that all the aggregate charts can link to.
- **Data:** the attempt snapshot plus `answers`.
- **Read it:** essential for feedback and for spotting grading problems.
  **Available now.**

---

## 7. Question and activity quality for the author

### 7.1 Question health flags
- **Question it answers:** Which questions should I rewrite?
- **Chart:** table with colored flags: too easy (p > 95%), too hard (p < 30%), low
  discrimination (D < 0.1), never answered, always unanswered by the low group.
- **Data:** 4.1, 4.2 and 4.9 combined.
- **Read it:** a short, actionable list is more useful than a chart here; pair it with the
  option distribution of each flagged question. **Available now.**

### 7.2 Activities without submissions
- **Question it answers:** Which activity was never actually taken?
- **Chart:** bar of attempts per activity including zeros.
- **Data:** all activities of the teacher left-joined with attempts.
- **Read it:** zero attempts usually means the code was never shared, not that the
  activity is bad. **Available now.**

### 7.3 Exam length calibration
- **Question it answers:** Is the number of questions proportional to the time students
  take?
- **Chart:** scatter, x = number of questions, y = median duration; one point per activity.
- **Data:** `questions.length` vs `submittedAt - createdAt`.
- **Read it:** points far above the trend are the activities that feel too long.
  **Available now.**

### 7.4 Option over-selection
- **Question it answers:** Is an incorrect option being chosen suspiciously often?
- **Chart:** the option distribution of 4.4 sorted by "correct option share" per question.
- **Data:** `answers.value.optionId`.
- **Read it:** when an incorrect option beats the correct one, the statement or the option
  is probably wrong, not the class. **Available now.**

---

## 8. Data gaps and changes needed before building the dashboard

1. **Time per question** — `timeSpentMs` exists in the model and the validator but is
   never sent by `frontend-quiz/src/App.jsx`. Measure the time per question in the quiz
   app and send it in `logAnswer`; then 5.2 becomes available.
2. **Teacher results API** — there is no endpoint today. Suggested shape:
   - `GET /api/activities/:id/results/summary` → attempts, unique students, completion
     rate, mean/median, pass rate.
   - `GET /api/activities/:id/results/questions` → per-question correct rate, option
     distribution, average time.
   - `GET /api/activities/:id/results/attempts` → per-student/attempt table.
   - `GET /api/activities/:id/results/timeline` → attempts per day.
   All of them must be scoped by `teacher` (`findByIdForTeacher`) and must never return
   the answer key to the student-facing app.
3. **Attempt policy** — decide per chart whether it uses all attempts, the latest attempt
   per student, or the best attempt. The score distribution and the leaderboard can differ
   a lot depending on this choice; show the policy in the chart subtitle.
4. **Groups/classes** — there is no `group`/`section` field today. Without it, comparison
   charts (3.7, 6.2) can only be per student or per activity, not per class.
5. **Concept grading** — exact-text comparison after normalization marks valid synonyms as
   wrong. Either add keyword-based grading, a manual review queue, or display concepts
   charts as "textual answers" rather than as correctness.
6. **Anonymous students** — `student` is nullable (`studentName` is always stored). Group
   unique students by `student` when present and fall back to `nameKey`-style normalization
   of `studentName`.
7. **Privacy** — student names and optional emails appear in these graphs; the drill-down
   should be behind the teacher session only, and exports should warn about personal data.

---

## 9. Chart selection cheat sheet

| Insight | Chart | Priority |
|---|---|---|
| Completion rate | horizontal bar | P1 |
| Score distribution | histogram | P1 |
| Correct rate per question | sorted horizontal bar | P1 |
| Answer option distribution | 100% stacked bar | P1 |
| Activity summary KPIs | KPI cards | P1 |
| Attempts over time | line/area | P1 |
| Score by attempt number | line | P2 |
| Difficulty vs discrimination | scatter | P2 |
| Matching confusion matrix | heatmap | P2 |
| Drop-off point | bar | P2 |
| Student leaderboard | table + inline bar | P2 |
| Time per question | bar + box plot | P2 (needs client change) |
| Participation heatmap | heatmap | P3 |
| Grade bands | donut | P3 |
| At-risk students | scatter + table | P3 |

Priority P1 = enough data today, highest classroom value; P2 = valuable with small effort;
P3 = nice to have once the dashboard exists.
