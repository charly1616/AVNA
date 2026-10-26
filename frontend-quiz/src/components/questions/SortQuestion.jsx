import { useMemo, useState } from "react";

import QuestionMedia from "@/components/QuestionMedia";

export default function SortQuestion({ question, value, onChange }) {
  const itemsById = useMemo(
    () => new Map(question.items.map((item) => [item.id, item])),
    [question.items]
  );

  const order = value?.order?.length
    ? value.order
    : question.items.map((item) => item.id);
  const ordered = order.map((id) => itemsById.get(id)).filter(Boolean);

  const [draggingId, setDraggingId] = useState(null);
  const [overId, setOverId] = useState(null);

  const commit = (items) => onChange({ order: items.map((item) => item.id) });

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;

    const next = [...ordered];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  };

  const dropOn = (targetId) => {
    if (draggingId === null || draggingId === targetId) {
      setDraggingId(null);
      setOverId(null);
      return;
    }

    const from = ordered.findIndex((item) => item.id === draggingId);
    const to = ordered.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;

    const next = [...ordered];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    commit(next);
    setDraggingId(null);
    setOverId(null);
  };

  return (
    <div className="sort-list">
      {ordered.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={(event) => {
            setDraggingId(item.id);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", String(item.id));
          }}
          onDragEnd={() => {
            setDraggingId(null);
            setOverId(null);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (overId !== item.id) setOverId(item.id);
          }}
          onDragLeave={() =>
            setOverId((current) => (current === item.id ? null : current))
          }
          onDrop={(event) => {
            event.preventDefault();
            dropOn(item.id);
          }}
          className={`sort-item ${
            draggingId === item.id ? "dragging" : ""
          } ${overId === item.id && draggingId !== item.id ? "drag-over" : ""}`}
        >
          <span className="handle" aria-hidden="true">
            ⋮⋮
          </span>
          <span className="k">{index + 1}</span>
          <span className="txt">
            {item.text}
            <QuestionMedia media={item.media} compact />
          </span>
          <span className="sort-arrows">
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              aria-label="Subir"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={index === ordered.length - 1}
              aria-label="Bajar"
            >
              ↓
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}
