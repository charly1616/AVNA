import AbcQuestion from "./questions/AbcQuestion";
import SortQuestion from "./questions/SortQuestion";
import LinesQuestion from "./questions/LinesQuestion";
import ConceptsQuestion from "./questions/ConceptsQuestion";

const renderers = {
  abc: AbcQuestion,
  sort: SortQuestion,
  lines: LinesQuestion,
  concepts: ConceptsQuestion,
};

export default function QuestionCard({
  question,
  index,
  total,
  value,
  onChange,
  onNext,
  onFinish,
  busy,
}) {
  const Renderer = renderers[question.type];
  const isLast = index === total - 1;

  return (
    <div className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-semibold text-[var(--brand)]">
          Pregunta {index + 1} / {total}
        </span>
      </div>

      <h2 className="mb-6 text-lg font-semibold leading-snug">{question.title}</h2>

      {Renderer && <Renderer question={question} value={value} onChange={onChange} />}

      <button
        type="button"
        onClick={isLast ? onFinish : onNext}
        disabled={busy}
        className="mt-6 w-full rounded-xl bg-[var(--brand)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--brand-d)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Guardando..." : isLast ? "Ver resultados" : "Siguiente"}
      </button>
    </div>
  );
}
