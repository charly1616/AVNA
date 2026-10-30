export const questionTypeLabels = {
  abc: "Opción múltiple",
  sort: "Ordenar",
  lines: "Emparejar",
  concepts: "Conceptos",
};

export const formatDuration = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.round((milliseconds ?? 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
};

export const formatDate = (value) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const formatShortDate = (value) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
};

export const scoreTone = (percent) => {
  if (percent >= 80) return "good";
  if (percent >= 50) return "warn";
  return "bad";
};
