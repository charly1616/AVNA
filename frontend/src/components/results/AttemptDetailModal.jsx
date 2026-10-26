import { useEffect } from "react";

import ResultsIcon from "./ResultsIcon.jsx";
import { formatDate, formatDuration, questionTypeLabels, scoreTone } from "../../utils/format.js";

const toneClasses = {
  good: "text-[#0e7a3c] bg-[#e6f7ed] border-[#bfe5cd]",
  warn: "text-[#8a6a00] bg-[#fff7d6] border-[#f0df9c]",
  bad: "text-[#a9352f] bg-[#ffefec] border-[#f2c9c4]",
};

export function AttemptDetailModal({
  open,
  loading,
  error,
  detail,
  onClose,
  onUpdateCorrectness,
  updatingQuestionId,
  updateError,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const attempt = detail?.attempt;
  const tone = toneClasses[scoreTone(attempt?.percent ?? 0)] ?? toneClasses.bad;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#062d20]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attempt-detail-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92svh] w-full max-w-[820px] overflow-y-auto rounded-t-[26px] bg-[#fbfbf6] shadow-[0_24px_70px_rgba(0,60,40,0.25)] sm:rounded-[26px]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#e4ebdf] bg-[#fbfbf6]/95 px-5 py-4 backdrop-blur sm:px-7 sm:py-5">
          <div className="min-w-0">
            <p className="text-[.68rem] font-extrabold uppercase tracking-[0.14em] text-[#718078]">Detalle del intento</p>
            <h2 id="attempt-detail-title" className="mt-1 truncate text-xl font-black text-[#00583f]">
              {attempt?.studentName || "Cargando resultado"}
            </h2>
            {attempt && (
              <p className="mt-1 text-sm text-[#718078]">
                {detail?.activity?.title} · {formatDate(attempt.submittedAt || attempt.createdAt)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#54705f] transition hover:bg-[#e8f1e3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#91c83e]"
          >
            <ResultsIcon name="close" className="h-5 w-5" />
          </button>
        </div>

        {loading && (
          <div className="px-6 py-16 text-center text-sm font-bold text-[#718078]">
            Cargando el detalle del intento...
          </div>
        )}

        {!loading && error && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-extrabold text-[#a9352f]">{error}</p>
          </div>
        )}

        {!loading && !error && attempt && (
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-black ${tone}`}>
                {attempt.percent}% · {attempt.score}/{attempt.total} correctas
              </span>
              <span className="inline-flex items-center gap-2 rounded-2xl border border-[#e4ebdf] bg-white px-4 py-2 text-sm font-bold text-[#54705f]">
                <ResultsIcon name="clock" className="h-4 w-4" />
                {formatDuration(attempt.durationMs)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-2xl border border-[#e4ebdf] bg-white px-4 py-2 text-sm font-bold text-[#54705f]">
                <ResultsIcon name="check" className="h-4 w-4" />
                {attempt.status === "submitted" ? "Entregado" : "En curso"}
              </span>
            </div>

            {updateError && (
              <p role="alert" className="mt-3 rounded-xl border border-[#f0d3cf] bg-[#fff9f8] px-4 py-2.5 text-sm font-bold text-[#a9352f]">
                {updateError}
              </p>
            )}

            <div className="mt-5 space-y-3">
              {detail.results.map((result) => (
                <article
                  key={result.questionId}
                  className={`rounded-2xl border p-4 sm:p-5 ${
                    result.isCorrect
                      ? "border-[#cbe7d4] bg-[#f5fcf7]"
                      : "border-[#f0d3cf] bg-[#fff9f8]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-black ${result.isCorrect ? "bg-[#dcf3e4] text-[#0e7a3c]" : "bg-[#ffe4e0] text-[#a9352f]"}`}>
                        {String(result.number).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-[#14301f]">{result.title}</h3>
                        <p className="mt-0.5 text-xs text-[#718078]">
                          {questionTypeLabels[result.type] ?? result.type} · {formatDuration(result.timeSpentMs)}
                        </p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[.68rem] font-extrabold ${result.isCorrect ? "bg-[#e6f7ed] text-[#0e7a3c]" : "bg-[#ffefec] text-[#a9352f]"}`}>
                      {result.answered ? (result.isCorrect ? "Correcta" : "Incorrecta") : "Sin responder"}
                    </span>
                  </div>

                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div className="rounded-xl bg-white/80 p-3">
                      <dt className="text-[.68rem] font-extrabold uppercase tracking-[0.1em] text-[#8aa095]">Respuesta del estudiante</dt>
                      <dd className="mt-1 font-semibold text-[#3f5a4c]">
                        {result.studentAnswer || "Sin respuesta"}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-white/80 p-3">
                      <dt className="text-[.68rem] font-extrabold uppercase tracking-[0.1em] text-[#8aa095]">Respuesta esperada</dt>
                      <dd className="mt-1 font-semibold text-[#3f5a4c]">
                        {result.expectedAnswer || "Evaluación abierta"}
                      </dd>
                    </div>
                  </dl>

                  {result.type === "concepts" && result.answered && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#eef2ea] pt-3">
                      <span className="mr-auto text-[.68rem] font-extrabold uppercase tracking-[0.1em] text-[#8aa095]">
                        Corrección manual
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateCorrectness?.(result.questionId, true)}
                        disabled={Boolean(updatingQuestionId) || result.isCorrect}
                        className="rounded-full border border-[#bfe5cd] bg-[#e6f7ed] px-3 py-1.5 text-xs font-extrabold text-[#0e7a3c] transition hover:bg-[#d8f1e1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#91c83e] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Marcar correcta
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateCorrectness?.(result.questionId, false)}
                        disabled={Boolean(updatingQuestionId) || !result.isCorrect}
                        className="rounded-full border border-[#f2c9c4] bg-[#ffefec] px-3 py-1.5 text-xs font-extrabold text-[#a9352f] transition hover:bg-[#fde3df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#91c83e] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Marcar incorrecta
                      </button>
                      {updatingQuestionId === result.questionId && (
                        <span className="text-xs font-bold text-[#54705f]">Guardando...</span>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttemptDetailModal;
