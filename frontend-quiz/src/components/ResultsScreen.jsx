import AppShell from "@/components/AppShell";

export default function ResultsScreen({ result, questions, activity, onRestart }) {
  const percent = result.percent;
  const incorrect = Math.max(result.total - result.score, 0);
  const message =
    percent === 100
      ? "¡Puntaje perfecto! Dominaste el tema."
      : percent >= 70
        ? "¡Muy bien! Vas por buen camino."
        : percent >= 40
          ? "Vas por buen camino, sigue practicando."
          : "Repasa el material e inténtalo de nuevo.";

  const emoji =
    percent === 100 ? "🏆" : percent >= 70 ? "🎉" : percent >= 40 ? "💪" : "📚";

  const titlesById = new Map(
    questions.filter(Boolean).map((question) => [question.id, question.title])
  );

  return (
    <AppShell
      current={result.total + 1}
      total={result.total}
      badge="Completado"
      activity={activity}
    >
      <div className="screen-center">
        <div className="panel results-panel">
          <div className="results-emoji">{emoji}</div>
          <h1 className="panel-title">Actividad completada</h1>
          <p className="panel-sub">
            Revisa tus resultados y vuelve a intentarlo cuando quieras.
          </p>

          <div className="score-ring" style={{ "--score": percent }}>
            <span>{percent}%</span>
          </div>

          <div className="result-stats">
            <div className="result-stat good">
              <b>{result.score}</b>
              <span>Correctas</span>
            </div>
            <div className="result-stat bad">
              <b>{incorrect}</b>
              <span>Incorrectas</span>
            </div>
            <div className="result-stat">
              <b>{result.total}</b>
              <span>Total</span>
            </div>
          </div>

          <p className="results-message">{message}</p>

          <ul className="result-list">
            {result.results.map((item, index) => (
              <li
                key={item.questionId}
                className="result-item"
                style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
              >
                <span
                  className={`result-icon ${item.isCorrect ? "ok" : "no"}`}
                  aria-hidden="true"
                >
                  {item.isCorrect ? "✓" : "✕"}
                </span>
                <span className="label">
                  {titlesById.get(item.questionId) || item.questionId}
                </span>
                <span className={`status ${item.isCorrect ? "ok" : "no"}`}>
                  {item.isCorrect ? "Correcta" : "Incorrecta"}
                </span>
              </li>
            ))}
          </ul>

          <button type="button" onClick={onRestart} className="btn primary block">
            ↺ Intentar de nuevo
          </button>
        </div>
      </div>
    </AppShell>
  );
}
