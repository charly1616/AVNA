export default function ConceptsQuestion({ question, value, onChange }) {
  const textFor = (cardId) =>
    value?.cards?.find((card) => card.cardId === cardId)?.text ?? "";

  const setText = (cardId, text) => {
    const others = (value?.cards ?? []).filter((card) => card.cardId !== cardId);
    onChange({ cards: [...others, { cardId, text }] });
  };

  return (
    <div className="flex flex-col gap-3">
      {question.cards.map((card) => (
        <div key={card.id} className="rounded-xl border border-[var(--line)] p-4">
          {card.title && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {card.title}
            </p>
          )}
          <p className="mb-3 font-medium">{card.question?.text}</p>
          <textarea
            value={textFor(card.id)}
            onChange={(event) => setText(card.id, event.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Escribe tu respuesta"
            className="w-full resize-y rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
          />
        </div>
      ))}
    </div>
  );
}
