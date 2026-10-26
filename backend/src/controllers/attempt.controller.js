import attemptService from "../services/attempt.service.js";

export const getActivity = async (req, res) => {
  const activity = await attemptService.getActivity(req.validated.params.code);
  res.status(200).json({ activity });
};

export const getQuestions = async (req, res) => {
  const questions = await attemptService.getQuestions(req.validated.params.code);
  res.status(200).json(questions);
};

export const getQuestion = async (req, res) => {
  const question = await attemptService.getQuestion(
    req.validated.params.code,
    req.validated.params.number
  );
  res.status(200).json(question);
};

export const start = async (req, res) => {
  const attempt = await attemptService.start(req.validated.params.code, req.body);
  res.status(201).json({ attempt });
};

export const logAnswer = async (req, res) => {
  const result = await attemptService.logAnswer(
    req.validated.params.attemptId,
    req.get("x-attempt-token"),
    req.body
  );
  res.status(200).json(result);
};

export const submit = async (req, res) => {
  const result = await attemptService.submit(
    req.validated.params.attemptId,
    req.get("x-attempt-token")
  );
  res.status(200).json({ result });
};

export const getAttempt = async (req, res) => {
  const attempt = await attemptService.getAttempt(
    req.validated.params.attemptId,
    req.get("x-attempt-token")
  );
  res.status(200).json({ attempt });
};

export const checkAnswer = async (req, res) => {
  const result = await attemptService.checkAnswer(
    req.validated.params.code,
    req.body
  );
  res.status(200).json({ result });
};
