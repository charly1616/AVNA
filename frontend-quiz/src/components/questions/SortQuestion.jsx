export default function SortQuestion({ question, value, onChange }) {
  const itemsById = new Map(question.items.map((item) => [item.id, item]));
  const order = value?.order?.length ? value.order : question.items.map((item) => item.id);
  const ordered = order.map((id) => itemsById.get(id)).filter(Boolean);

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;

    const next = [...ordered];
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ order: next.map((item) => item.id) });
  };

  return (
    <div className="flex flex-col gap-3">
      {ordered.map((item, index) => (
        <div
          key={item.id}
          className="flex items-center gap-3 rounded-xl border border-[var(--line)] px-4 py-3"
        >
          <span className="font-bold text-[var(--muted)]">{index + 1}.</span>
          <span className="flex-1">{item.text}</span>
          <span className="flex gap-1">
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              aria-label="Subir"
              className="rounded-lg border border-[var(--line)] px-2 py-1 text-sm disabled:opacity-40"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={index === ordered.length - 1}
              aria-label="Bajar"
              className="rounded-lg border border-[var(--line)] px-2 py-1 text-sm disabled:opacity-40"
            >
              ↓
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}
