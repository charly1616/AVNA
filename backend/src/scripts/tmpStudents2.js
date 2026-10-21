import mongoose from "mongoose";
import { ENV } from "../config/env.js";

const BASE = "http://localhost:4000/api";
const CODE = "quiz-de-fundamentos-frontend";

const call = async (method, url, body, headers = {}) => {
  const response = await fetch(`${BASE}${url}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  return { status: response.status, data: text ? JSON.parse(text) : null };
};

const run = async () => {
  await mongoose.connect(ENV.mongodbUri, { dbName: ENV.mongodbDbName });

  const name = `Estudiante Prueba ${Date.now()}`;

  const register = await call("POST", "/public/students", { name });
  console.log("register ->", register.status);

  const start = await call("POST", `/public/activities/${CODE}/attempts`, {
    studentToken: register.data.student.token,
  });
  console.log("start ->", start.status, JSON.stringify(start.data).slice(0, 400));

  const start2 = await call("POST", `/public/activities/${CODE}/attempts`, {
    studentToken: register.data.student.token,
    studentName: name,
  });
  console.log("start con nombre + token ->", start2.status, start2.data.attempt ? "ok" : JSON.stringify(start2.data).slice(0, 300));

  await mongoose.connection.collection("attempts").deleteMany({ studentName: name });
  await mongoose.connection.collection("students").deleteMany({ nameKey: name.toLowerCase() });

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
