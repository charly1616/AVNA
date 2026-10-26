import QuestionMedia from "./QuestionMedia";
import AbcQuestion from "./questions/AbcQuestion";
import ConceptsQuestion from "./questions/ConceptsQuestion";
import LinesQuestion from "./questions/LinesQuestion";
import SortQuestion from "./questions/SortQuestion";

const renderers = {
  abc: AbcQuestion,
  sort: SortQuestion,
  lines: LinesQuestion,
  concepts: ConceptsQuestion,
};

const questionMeta = {
  abc: {
    label: "Opción múltiple",
    icon: "A",
    sub: "Elige la mejor respuesta",
  },
  sort: {
    label: "Ordenar",
    icon: "↕",
    sub: "Arrastra y suelta para ordenar los pasos",
  },
  lines: {
    label: "Emparejar",
    icon: "⇄",
    sub: "Toca un concepto y luego su pareja",
  },
  concepts: {
    label: "Tarjetas sorpresa",
    icon: "✦",
    sub: "Elige una tarjeta y responde su pregunta",
  },
};

function isAnswered(question, value) {
  switch (question.type) {
    case "abc":
      return Boolean(value?.optionId);
    case "sort":
      return Boolean(value?.order?.length);
    case "lines":
      return (value?.matches?.length ?? 0) === question.lefts.length;
    case "concepts":
      return Boolean(value?.cards?.some((card) => card.text?.trim()));
    default:
      return true;
  }
}

export default function QuestionCard({
  question,
  index,
  total,
  value,
  onChange,
  checks,
  onNext,
  onFinish,
  busy,
}) {
  const Renderer = renderers[question.type];
  const meta = questionMeta[question.type] ?? {
    label: "Pregunta",
    icon: "?",
    sub: "Responde para continuar",
  };
  const isLast = index === total - 1;
  const answered = isAnswered(question, value);
  const saveClass = busy ? "is-busy" : answered ? "is-ready" : "";

  return (
    <div className={`q-card type-${question.type}`}>
      <div className="q-content">
        <div className="q-badge">
          <span className="badge-icon" aria-hidden="true">
            {meta.icon}
          </span>
          {meta.label}
        </div>

        <h2 className="q-title">{question.title}</h2>
        <p className="q-sub">{meta.sub}</p>

        <QuestionMedia media={question.media} className="question-media" />

        {Renderer && (
          <Renderer
            question={question}
            value={value}
            onChange={onChange}
            checks={checks}
            busy={busy}
          />
        )}
      </div>

      <div className="actions">
        <span className={`save-state ${saveClass}`} aria-live="polite">
          {busy
            ? "Guardando…"
            : answered
              ? "Respuesta lista"
              : "Completa tu respuesta"}
        </span>
        <button
          type="button"
          onClick={isLast ? onFinish : onNext}
          disabled={busy || !answered}
          className="btn primary"
        >
          {busy ? "Guardando..." : isLast ? "Ver resultados →" : "Siguiente →"}
        </button>
      </div>
    </div>
  );
}
