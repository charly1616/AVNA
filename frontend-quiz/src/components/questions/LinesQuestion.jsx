import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import QuestionMedia from "@/components/QuestionMedia";

const EMPTY_MATCHES = [];

export default function LinesQuestion({ question, value, onChange }) {
  const lefts = question.lefts;
  const rights = question.rights;
  const matches = value?.matches ?? EMPTY_MATCHES;

  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [active, setActive] = useState(null);

  const isLeftConnected = (id) => matches.some((match) => match.leftId === id);
  const isRightConnected = (id) => matches.some((match) => match.rightId === id);

  const setMatch = (leftId, rightId) => {
    const next = matches.filter(
      (match) => match.leftId !== leftId && match.rightId !== rightId
    );
    onChange({ matches: [...next, { leftId, rightId }] });
  };

  const handleClick = (side, id) => {
    if (!active) {
      setActive({ side, id });
      return;
    }

    if (active.side === side) {
      setActive({ side, id });
      return;
    }

    const leftId = side === "left" ? id : active.id;
    const rightId = side === "right" ? id : active.id;
    setMatch(leftId, rightId);
    setActive(null);
  };

  const clearMatches = () => {
    setActive(null);
    onChange({ matches: [] });
  };

  const drawLines = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    svg.innerHTML = "";
    const containerRect = container.getBoundingClientRect();

    matches.forEach(({ leftId, rightId }) => {
      const leftTile = container.querySelector(
        `.mtile[data-side="left"][data-id="${leftId}"]`
      );
      const rightTile = container.querySelector(
        `.mtile[data-side="right"][data-id="${rightId}"]`
      );
      if (!leftTile || !rightTile) return;

      const leftRect = leftTile.getBoundingClientRect();
      const rightRect = rightTile.getBoundingClientRect();

      const x1 = leftRect.right - containerRect.left;
      const y1 = leftRect.top - containerRect.top + leftRect.height / 2;
      const x2 = rightRect.left - containerRect.left;
      const y2 = rightRect.top - containerRect.top + rightRect.height / 2;
      const curve = Math.abs(x2 - x1) * 0.5;

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute(
        "d",
        `M ${x1} ${y1} C ${x1 + curve} ${y1}, ${x2 - curve} ${y2}, ${x2} ${y2}`
      );
      path.setAttribute("class", "svg-line");
      svg.appendChild(path);
    });
  }, [matches]);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(drawLines);
    return () => cancelAnimationFrame(frame);
  }, [drawLines]);

  useEffect(() => {
    window.addEventListener("resize", drawLines);
    return () => window.removeEventListener("resize", drawLines);
  }, [drawLines]);

  return (
    <div>
      <div className="match-container" ref={containerRef}>
        <svg className="svg-overlay" ref={svgRef} />
        <div className="match-col">
          {lefts.map((left) => {
            const isActive = active?.side === "left" && active.id === left.id;
            return (
              <button
                key={left.id}
                type="button"
                data-side="left"
                data-id={left.id}
                onClick={() => handleClick("left", left.id)}
                aria-pressed={isActive || isLeftConnected(left.id)}
                className={`mtile ${isActive ? "active" : ""} ${
                  isLeftConnected(left.id) ? "connected" : ""
                }`}
              >
                <span className="mtile-content">
                  {left.text}
                  <QuestionMedia media={left.media} compact />
                </span>
              </button>
            );
          })}
        </div>
        <div className="match-col">
          {rights.map((right) => {
            const isActive = active?.side === "right" && active.id === right.id;
            return (
              <button
                key={right.id}
                type="button"
                data-side="right"
                data-id={right.id}
                onClick={() => handleClick("right", right.id)}
                aria-pressed={isActive || isRightConnected(right.id)}
                className={`mtile ${isActive ? "active" : ""} ${
                  isRightConnected(right.id) ? "connected" : ""
                }`}
              >
                <span className="mtile-content">
                  {right.text}
                  <QuestionMedia media={right.media} compact />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="match-status" aria-live="polite">
        {matches.length} de {lefts.length} parejas conectadas
      </p>

      {matches.length > 0 && (
        <div className="match-actions">
          <button
            type="button"
            className="btn ghost small"
            onClick={clearMatches}
          >
            Limpiar líneas
          </button>
        </div>
      )}
    </div>
  );
}
