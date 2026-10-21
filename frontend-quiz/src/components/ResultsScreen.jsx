export default function ResultsScreen({ result, questions, onRestart }) {
  const percent = result.percent;
  const message =
    percent === 100
      ? "¡Puntaje perfecto! Dominaste el tema."
      : percent >= 70
        ? "¡Muy bien! Vas por buen camino."
        : percent >= 40
          ? "Vas por buen camino, sigue practicando."
          : "Repasa el material e inténtalo de nuevo.";

  const titlesById = new Map(
    questions.filter(Boolean).map((question) => [question.id, question.title])
  );

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--card)] p-8 text-center shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">Actividad completada</h1>
        <p className="mb-6 text-sm text-[var(--muted)]">{message}</p>

        <div className="mb-6 flex items-baseline justify-center gap-2">
          <span className="text-5xl font-bold text-[var(--brand)]">{result.score}</span>
          <span className="text-xl font-semibold text-[var(--muted)]">/ {result.total}</span>
        </div>

        <div className="mb-6 h-3 overflow-hidden rounded-full bg-[var(--line)]">
          <div
            className={`h-full rounded-full transition-all ${
              percent >= 70 ? "bg-[var(--green)]" : percent >= 40 ? "bg-amber-400" : "bg-[var(--red)]"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <ul className="mb-6 flex flex-col gap-2 text-left text-sm">
          {result.results.map((item, index) => (
            <li
              key={item.questionId}
              className="flex items-start gap-2 rounded-lg border border-[var(--line)] px-3 py-2"
            >
              <span className="font-bold text-[var(--muted)]">{index + 1}.</span>
              <span className="flex-1">{titlesById.get(item.questionId) || item.questionId}</span>
              <span
                className={`font-semibold ${
                  item.isCorrect ? "text-[var(--green)]" : "text-[var(--red)]"
                }`}
              >
                {item.isCorrect ? "Correcta" : "Incorrecta"}
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onRestart}
          className="w-full rounded-xl bg-[var(--brand)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--brand-d)]"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
