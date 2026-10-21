import mongoose from "mongoose";
import { ENV } from "../config/env.js";

const BASE = "http://localhost:4001/api";
const name = `test-teacher-${Date.now()}`;

const call = async (method, url, body, token) => {
  const response = await fetch(`${BASE}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-attempt-token": token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  return { status: response.status, data: text ? JSON.parse(text) : null, setCookie: response.headers.getSetCookie?.()?.join(";") };
};

const run = async () => {
  await mongoose.connect(ENV.mongodbUri, { dbName: ENV.mongodbDbName });

  const register = await call("POST", "/auth/register", { name, password: "test1234" });
  console.log("register ->", register.status);

  const login = await call("POST", "/auth/login", { name, password: "test1234" });
  const setCookie = login.setCookie ?? "";
  const cookie = setCookie.split(";")[0];
  console.log("login ->", login.status, "cookie:", cookie ? "yes" : "no");

  const withCookie = async (method, url, body) => {
    const response = await fetch(`${BASE}${url}`, {
      method,
      headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    return { status: response.status, data: text ? JSON.parse(text) : null };
  };

  const created = await withCookie("POST", "/activities", {
    title: `Actividad de prueba ${Date.now()}`,
    description: "prueba",
    color: "#006b4b",
    icon: "brain",
  });
  console.log("create ->", created.status, JSON.stringify(created.data?.activity?.link));
  console.log("slug ->", created.data?.activity?.slug);

  const list = await withCookie("GET", "/activities");
  console.log("list ->", list.status, "links:", list.data?.activities?.map((a) => a.link));

  const slug = created.data.activity.slug;
  const publicActivity = await call("GET", `/public/activities/${slug}`);
  console.log("public ->", publicActivity.status, JSON.stringify(publicActivity.data));

  const renamed = await withCookie("PATCH", `/activities/${created.data.activity.id}`, {
    title: `Actividad renombrada ${Date.now()}`,
  });
  console.log("rename ->", renamed.status, JSON.stringify(renamed.data?.activity?.link));

  await mongoose.connection.collection("activities").deleteMany({ title: /Actividad de prueba|Actividad renombrada/ });
  await mongoose.connection.collection("teachers").deleteMany({ name });
  console.log("test data removed");

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
