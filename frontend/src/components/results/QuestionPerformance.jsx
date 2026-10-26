import ResultsIcon from "./ResultsIcon.jsx";
import { formatDuration, questionTypeLabels, scoreTone } from "../../utils/format.js";

const toneClasses = {
  good: { bar: "bg-[#1fae5a]", text: "text-[#0e7a3c]", soft: "bg-[#e6f7ed]" },
  warn: { bar: "bg-[#e0b21a]", text: "text-[#8a6a00]", soft: "bg-[#fff7d6]" },
  bad: { bar: "bg-[#d05a52]", text: "text-[#a9352f]", soft: "bg-[#ffefec]" },
};

export function QuestionPerformance({ questions }) {
  return (
    <section className="rounded-2xl border border-[#e4ebdf] bg-white p-5 shadow-[0_5px_18px_rgba(0,76,51,0.04)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-extrabold text-[#00583f]">
            <ResultsIcon name="list" className="h-[18px] w-[18px] text-[#006b4b]" />
            Rendimiento por pregunta
          </h2>
          <p className="mt-1 text-sm text-[#718078]">
            Aciertos sobre las respuestas entregadas en cada pregunta.
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-[#f4f8f0] px-3 py-1 text-xs font-extrabold text-[#54705f] sm:inline">
          {questions.length} preguntas
        </span>
      </div>

      <div className="mt-5 divide-y divide-[#eef2ea]">
        {questions.map((question) => {
          const tone = toneClasses[scoreTone(question.accuracy)] ?? toneClasses.bad;

          return (
            <article key={question.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 lg:grid-cols-[minmax(0,1fr)_190px_130px] lg:items-center lg:gap-6">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#eef5e9] text-xs font-black text-[#006b4b]">
                  {String(question.number).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-[#14301f]">{question.title}</p>
                  <p className="mt-0.5 text-xs text-[#718078]">
                    {questionTypeLabels[question.type] ?? question.type} · {formatDuration(question.averageTimeMs)} promedio
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#eef3ea]">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${tone.bar}`}
                    style={{ width: `${question.accuracy}%` }}
                  />
                </div>
                <span className={`w-11 text-right text-sm font-black ${tone.text}`}>
                  {question.accuracy}%
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 lg:justify-end">
                <span className={`rounded-full px-2.5 py-1 text-[.7rem] font-extrabold ${tone.soft} ${tone.text}`}>
                  {question.correctCount}/{question.answeredCount} aciertos
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default QuestionPerformance;
