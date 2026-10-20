import { createHmac } from "node:crypto";
import { ENV } from "../config/env.js";

const ACTIVITY_LINK_BASE_URL = "https://avna.example/actividades";

export const createActivityLink = (title) => {
  const titleHash = createHmac("sha256", ENV.activityLinkSecret)
    .update(title.normalize("NFKC").trim().toLowerCase())
    .digest("base64url")
    .slice(0, 15);

  return `${ACTIVITY_LINK_BASE_URL}/${titleHash}`;
};

export default createActivityLink;
