import { activityColor, activityIcon } from "@/utils/activityVisual";

export default function AppShell({
  children,
  activity = null,
  current = 0,
  total = 0,
  badge,
}) {
  const showStrip = Number.isFinite(total) && total > 0;
  const isComplete = showStrip && current > total;
  const safeCurrent = Math.min(Math.max(current, 0), total || current);
  const label =
    badge ??
    (showStrip ? `Pregunta ${Math.min(safeCurrent, total)} de ${total}` : null);
  const compressed = total > 12;
  const progress = total > 0 ? (Math.min(safeCurrent, total) / total) * 100 : 0;
  const color = activityColor(activity?.color);
  const icon = activity ? activityIcon(activity.icon) : "✦";

  return (
    <div className="app-root">
      <div className="bg-shape top-left" />
      <div className="bg-shape bottom-right" />

      <div className="app-container">
        <header>
          <div className="brand">
            <div
              className={`logo-mark ${color ? "has-activity" : ""}`}
              style={color ? { "--activity": color } : undefined}
            >
              {icon}
            </div>
            <div className="brand-text">
              <p className="brand-eyebrow">
                {activity ? "AVNA Exam" : "Simón Bolívar"}
              </p>
              <h1>{activity?.title || "AVNA Exam"}</h1>
            </div>
          </div>
          {label && <div className="progress-badge">{label}</div>}
        </header>

        {showStrip && (
          <div
            className="strip-container"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax={total}
            aria-valuenow={Math.min(safeCurrent, total)}
            aria-label="Progreso de la actividad"
          >
            {compressed ? (
              <div className="strip-progress">
                <span style={{ width: `${progress}%` }} />
              </div>
            ) : (
              Array.from({ length: total }, (_, i) => {
                let className = "strip-step";
                if (isComplete) className += " done";
                else if (i < safeCurrent - 1) className += " done";
                else if (i === safeCurrent - 1) className += " active";
                return <div key={i} className={className} />;
              })
            )}
          </div>
        )}

        <div className="screen-content">{children}</div>
      </div>
    </div>
  );
}
