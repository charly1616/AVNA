import { ENV } from "../config/env.js";

/**
 * The public code of an activity: the readable slug that is used in the share
 * link, e.g. "actividad-figuroaventura".
 */
export const createActivityCode = (title) => {
  const normalized = String(title ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");

  return normalized || "actividad";
};

/**
 * Activities created before the code existed keep the code inside their link,
 * so it is read from there when the field is missing.
 */
export const resolveActivityCode = (activity) => {
  if (activity?.code) return activity.code;

  const link = activity?.link ?? "";
  const fromLink = link.split("/").filter(Boolean).pop();

  if (fromLink) return fromLink;

  return createActivityCode(activity?.title ?? "");
};

export const buildActivityLink = (code) => `${ENV.quizAppUrl}/a/${code}`;

export const createActivityLink = (title) => buildActivityLink(createActivityCode(title));

export default createActivityLink;
