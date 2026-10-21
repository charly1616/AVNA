export default function LinesQuestion({ question, value, onChange }) {
  const matchFor = (leftId) =>
    value?.matches?.find((match) => match.leftId === leftId)?.rightId ?? "";

  const setMatch = (leftId, rightId) => {
    const others = (value?.matches ?? []).filter((match) => match.leftId !== leftId);
    onChange({ matches: [...others, { leftId, rightId }] });
  };

  return (
    <div className="flex flex-col gap-3">
      {question.lefts.map((left) => (
        <div
          key={left.id}
          className="grid gap-2 rounded-xl border border-[var(--line)] p-3 sm:grid-cols-[1fr_1fr] sm:items-center"
        >
          <span className="font-medium">{left.text}</span>
          <select
            value={matchFor(left.id)}
            onChange={(event) => setMatch(left.id, event.target.value)}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
          >
            <option value="">Elige una opción</option>
            {question.rights.map((right) => (
              <option key={right.id} value={right.id}>
                {right.text}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
