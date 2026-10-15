import activityService from "../services/activity.service.js";

export const create = async (req, res) => {
  const activity = await activityService.create(req.teacher._id, req.body);
  res.status(201).json({ activity });
};

export const list = async (req, res) => {
  const result = await activityService.list(req.teacher._id, req.validated.query);
  res.status(200).json(result);
};

export const get = async (req, res) => {
  const activity = await activityService.get(req.teacher._id, req.validated.params.id);
  res.status(200).json({ activity });
};

export const update = async (req, res) => {
  const activity = await activityService.update(req.teacher._id, req.validated.params.id, req.body);
  res.status(200).json({ activity });
};

export const replaceQuestions = async (req, res) => {
  const activity = await activityService.replaceQuestions(
    req.teacher._id,
    req.validated.params.id,
    req.body.questions
  );
  res.status(200).json({ activity });
};

export const remove = async (req, res) => {
  await activityService.delete(req.teacher._id, req.validated.params.id);
  res.status(200).json({ message: "Activity deleted" });
};