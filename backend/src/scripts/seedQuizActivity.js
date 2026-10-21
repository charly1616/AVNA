/**
 * Creates a demo teacher with one activity that contains every question type,
 * so the quiz app can be tried out end to end.
 *
 * Usage: npm run seed --prefix backend
 */
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { ENV } from "../config/env.js";
import Teacher from "../models/teacher.model.js";
import Activity from "../models/activity.model.js";
import activityService from "../services/activity.service.js";

const DEMO_TEACHER = { name: "demo", password: "demo1234" };

const ACTIVITY = {
  title: "Quiz de Fundamentos Frontend",
  description: "Cuatro preguntas para poner a prueba lo aprendido en clase.",
  color: "#4f46e5",
  icon: "brain",
};

const questions = [
  {
    id: "q-abc-1",
    type: "abc",
    title: "¿Cuál de estos etiqueta define un párrafo de texto?",
    order: 0,
    media: [],
    options: [
      { text: "<p>", media: [] },
      { text: "<br>", media: [] },
      { text: "<div>", media: [] },
      { text: "<span>", media: [] },
    ],
    correctOption: 0,
  },
  {
    id: "q-sort-1",
    type: "sort",
    title: "Ordena las fases del ciclo de vida de un componente de React",
    order: 1,
    media: [],
    items: [
      { text: "Renderizado", media: [] },
      { text: "Montaje", media: [] },
      { text: "Actualización de estado", media: [] },
      { text: "Desmontaje", media: [] },
    ],
  },
  {
    id: "q-lines-1",
    type: "lines",
    title: "Relaciona cada método con su descripción",
    order: 2,
    media: [],
    pairs: [
      { left: { text: "useState", media: [] }, right: { text: "Guarda estado en un componente", media: [] } },
      { left: { text: "useEffect", media: [] }, right: { text: "Ejecuta código tras el renderizado", media: [] } },
      { left: { text: "useMemo", media: [] }, right: { text: "Memoriza un valor calculado", media: [] } },
    ],
  },
  {
    id: "q-concepts-1",
    type: "concepts",
    title: "Tarjetas sorpresa: responde con tus palabras",
    order: 3,
    media: [],
    concepts: [
      {
        id: "c-1",
        title: "Props",
        question: { text: "¿Qué son las props?", media: [] },
        expectedAnswer: { text: "Los datos que un componente recibe de su padre", media: [] },
        media: [],
      },
      {
        id: "c-2",
        title: "Estado",
        question: { text: "¿Qué es el estado de un componente?", media: [] },
        expectedAnswer: { text: "La información que el componente guarda y gestiona por su cuenta", media: [] },
        media: [],
      },
    ],
  },
];

const run = async () => {
  await connectDatabase();

  let teacher = await Teacher.findOne({ name: DEMO_TEACHER.name });
  if (!teacher) {
    teacher = await Teacher.create(DEMO_TEACHER);
    console.log(`[seed] teacher "${DEMO_TEACHER.name}" created`);
  } else {
    console.log(`[seed] teacher "${DEMO_TEACHER.name}" already exists`);
  }

  // Remove previous demo activities so the code stays stable.
  await Activity.deleteMany({ teacher: teacher._id, title: ACTIVITY.title });

  const activity = await activityService.create(teacher._id, {
    title: ACTIVITY.title,
    description: ACTIVITY.description,
    color: ACTIVITY.color,
    icon: ACTIVITY.icon,
  });

  await activityService.replaceQuestions(teacher._id, activity._id, questions);

  console.log(`[seed] activity created: ${activity.link}`);
  console.log(`[seed] code: ${activity.code}`);
  console.log(`[seed] open the quiz at: ${activity.link}`);

  await disconnectDatabase();
};

run().catch(async (error) => {
  console.error("[seed] failed:", error.message);
  console.error("Is MongoDB running? Check MONGODB_URI in backend/.env");
  await disconnectDatabase();
  process.exit(1);
});
