import ResultsIcon from "@/shared/components/icons/ResultsIcon.jsx";
import { questionTypeLabels, scoreTone } from "../../../shared/lib/format.js";

const toneClasses = {
  good: { text: "text-[#0e7a3c]", bar: "bg-[#1fae5a]", soft: "bg-[#e6f7ed]" },
  warn: { text: "text-[#8a6a00]", bar: "bg-[#e0b21a]", soft: "bg-[#fff7d6]" },
  bad: { text: "text-[#a9352f]", bar: "bg-[#d05a52]", soft: "bg-[#ffefec]" },
};

export function TypePerformance({ types }) {
  return (
    <section className="rounded-2xl border border-[#e4ebdf] bg-white p-5 shadow-[0_5px_18px_rgba(0,76,51,0.04)] sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-extrabold text-[#00583f]">
        <ResultsIcon name="target" className="h-[18px] w-[18px] text-[#006b4b]" />
        Por tipo de pregunta
      </h2>
      <p className="mt-1 text-sm text-[#718078]">Precisión agrupada por dinámica.</p>

      <div className="mt-5 space-y-4">
        {types.map((type) => {
          const tone = toneClasses[scoreTone(type.accuracy)] ?? toneClasses.bad;

          return (
            <div key={type.type}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-extrabold text-[#3f5a4c]">
                  {questionTypeLabels[type.type] ?? type.type}
                </span>
                <span className={`text-sm font-black ${tone.text}`}>{type.accuracy}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#eef3ea]">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${tone.bar}`}
                  style={{ width: `${type.accuracy}%` }}
                />
              </div>
              <p className="mt-1.5 text-[.7rem] font-semibold text-[#8aa095]">
                {type.correctCount}/{type.answeredCount} respuestas correctas · {type.questions} preguntas
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TypePerformance;
