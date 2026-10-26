import resultsService from "../services/results.service.js";

export const getActivityResults = async (req, res) => {
  const results = await resultsService.getActivityResults(
    req.teacher._id,
    req.validated.params.id
  );
  res.status(200).json({ results });
};

export const getAttemptResult = async (req, res) => {
  const result = await resultsService.getAttemptResult(
    req.teacher._id,
    req.validated.params.id,
    req.validated.params.attemptId
  );
  res.status(200).json({ result });
};

export const updateAttemptAnswer = async (req, res) => {
  const result = await resultsService.updateAnswerCorrectness(
    req.teacher._id,
    req.validated.params.id,
    req.validated.params.attemptId,
    req.validated.params.questionId,
    req.body.isCorrect
  );
  res.status(200).json({ result });
};
