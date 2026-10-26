import { ENV } from "../config/env.js";

class VerifierError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

const buildVerifierUrl = () => {
  const host = ENV.verifierServiceHost;
  const port = ENV.verifierServicePort;
  return `http://${host}:${port}/verify`;
};

/**
 * Asks the Python answer-equivalence service whether a free-text answer means
 * the same as the expected one. That service owns the model, so the backend
 * only forwards the three texts and trusts its verdict.
 */
export const verifyAnswer = async ({ question, expectedAnswer, answer }) => {
  let response;

  try {
    response = await fetch(buildVerifierUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        expected_answer: expectedAnswer,
        answer,
      }),
      signal: AbortSignal.timeout(ENV.verifierServiceTimeoutMs),
    });
  } catch (error) {
    throw new VerifierError("No se pudo conectar con el servicio de verificación");
  }

  if (!response.ok) {
    throw new VerifierError("El servicio de verificación rechazó la solicitud");
  }

  const data = await response.json().catch(() => null);

  if (!data || typeof data.correct !== "boolean") {
    throw new VerifierError("Respuesta inválida del servicio de verificación");
  }

  return {
    correct: data.correct,
    confidence: typeof data.confidence === "number" ? data.confidence : null,
  };
};

export default verifyAnswer;
