import studentService from "../services/student.service.js";

export const register = async (req, res) => {
  const student = await studentService.register(req.body.name);
  res.status(201).json({ student });
};

export const me = async (req, res) => {
  const student = await studentService.getMe(req.get("x-student-token"));
  res.status(200).json({ student });
};
