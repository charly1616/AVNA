import QuestionMedia from "@/components/QuestionMedia";

export default function AbcQuestion({ question, value, onChange }) {
  const selectedId = value?.optionId ?? null;

  return (
    <div className="opts">
      {question.options.map((option, index) => {
        const isSelected = option.id === selectedId;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange({ optionId: option.id })}
            className={`opt ${isSelected ? "sel" : ""}`}
            aria-pressed={isSelected}
          >
            <span className="k">{String.fromCharCode(65 + index)}</span>
            <span className="opt-text">
              {option.text}
              <QuestionMedia media={option.media} compact />
            </span>
            {isSelected && (
              <span className="opt-check" aria-hidden="true">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
