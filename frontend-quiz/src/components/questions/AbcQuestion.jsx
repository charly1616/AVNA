export default function AbcQuestion({ question, value, onChange }) {
  const selectedId = value?.optionId ?? null;

  return (
    <div className="flex flex-col gap-3">
      {question.options.map((option, index) => {
        const isSelected = option.id === selectedId;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange({ optionId: option.id })}
            className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
              isSelected
                ? "border-[var(--brand)] bg-indigo-50"
                : "border-[var(--line)] hover:border-[var(--brand)] hover:bg-indigo-50"
            }`}
          >
            <span className="font-bold text-[var(--muted)]">
              {String.fromCharCode(65 + index)}.
            </span>
            <span className="flex-1">
              {option.text}
              {option.media?.map((media) => (
                <img
                  key={media.url || media.storageKey}
                  src={media.url}
                  alt={media.altText || ""}
                  className="mt-2 max-w-full rounded-lg"
                />
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
}
