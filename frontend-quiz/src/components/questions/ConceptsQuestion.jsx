import { useState } from "react";

import QuestionMedia from "@/components/QuestionMedia";

export default function ConceptsQuestion({ question, value, onChange, checks, busy }) {
  const [selectedId, setSelectedId] = useState(null);
  const cards = value?.cards ?? [];
  const selected = question.cards.find((card) => card.id === selectedId) ?? null;

  const textFor = (cardId) =>
    cards.find((card) => card.cardId === cardId)?.text ?? "";

  const setText = (cardId, text) => {
    const others = cards.filter((card) => card.cardId !== cardId);
    onChange({ cards: [...others, { cardId, text }] });
  };

  if (!selected) {
    return (
      <div className="concept-grid">
        {question.cards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            className="ccard"
            onClick={() => setSelectedId(card.id)}
            aria-pressed={false}
          >
            <span className="c-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="c-lbl">Concepto</span>
            <span className="c-name">{card.title || "Concepto"}</span>
            <QuestionMedia media={card.media} compact />
            <span className="c-hint">Pregunta oculta · toca para revelar</span>
          </button>
        ))}
      </div>
    );
  }

  const answer = textFor(selected.id);
  const check = checks?.[selected.id] ?? null;

  return (
    <div>
      <div className="concept-selected">
        <span className="c-lbl">Concepto seleccionado</span>
        <span className="c-name">{selected.title || "Concepto"}</span>
        <span className="c-hint">Elección bloqueada · puedes cambiarla</span>
        <QuestionMedia media={selected.media} className="question-media" />
      </div>

      <div className="concept-question">
        <div className="concept-q-label">Tu pregunta</div>
        {selected.question?.text && (
          <p className="concept-q">{selected.question.text}</p>
        )}
        <QuestionMedia media={selected.question?.media} />
        <textarea
          className="ta"
          value={answer}
          onChange={(event) => setText(selected.id, event.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Escribe tu respuesta en tus propias palabras…"
          aria-label={`Respuesta para ${selected.title || "el concepto"}`}
        />
        <div className="ta-meta">{answer.length} / 500</div>

        {check && (
          <p
            className={`answer-check ${check.correct ? "ok" : "no"}`}
            role="status"
          >
            <span aria-hidden="true">{check.correct ? "✓" : "✗"}</span>
            {check.correct
              ? "Tu respuesta es equivalente a la esperada."
              : "Tu respuesta todavía no coincide con la esperada."}
            {typeof check.confidence === "number" && (
              <span className="answer-check-confidence">
                {Math.round(check.confidence * 100)}% de confianza
              </span>
            )}
          </p>
        )}

        {busy && !check && (
          <p className="answer-check pending" role="status">
            Verificando tu respuesta…
          </p>
        )}
      </div>

      <div className="match-actions">
        <button
          type="button"
          className="btn ghost small"
          onClick={() => setSelectedId(null)}
        >
          Cambiar tarjeta
        </button>
      </div>
    </div>
  );
}
