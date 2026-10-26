import { useState } from "react";

import AppShell from "@/components/AppShell";
import { activityColor, activityIcon } from "@/utils/activityVisual";

export default function StartScreen({ activity, onStart, busy, error, initialName = "" }) {
  const [studentName, setStudentName] = useState(initialName);
  const [studentEmail, setStudentEmail] = useState("");
  const color = activityColor(activity.color);

  function handleSubmit(event) {
    event.preventDefault();
    if (!studentName.trim() || busy) return;
    onStart({ studentName: studentName.trim(), studentEmail: studentEmail.trim() });
  }

  return (
    <AppShell badge="Actividad" activity={activity}>
      <div className="screen-center">
        <div className="panel wide">
          <div className="q-badge">
            <span className="dot" />
            Bienvenido
          </div>

          <div
            className="activity-hero"
            style={color ? { "--activity": color } : undefined}
          >
            <div className="activity-hero-head">
              <div className="activity-icon" aria-hidden="true">
                {activityIcon(activity.icon)}
              </div>
              <div>
                <h2>{activity.title}</h2>
                {activity.description && <p>{activity.description}</p>}
              </div>
            </div>

            <div className="meta-chips">
              <span className="meta-chip">
                <b>{activity.totalQuestions}</b> preguntas
              </span>
              <span className="meta-chip">A tu ritmo</span>
              <span className="meta-chip">Resultados al final</span>
            </div>
          </div>

          {activity.active === false && (
            <p className="notice">
              Esta actividad está marcada como inactiva, pero puedes abrirla.
            </p>
          )}

          <form onSubmit={handleSubmit} className="form-stack" noValidate>
            <label className="field">
              Tu nombre
              <input
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                required
                maxLength={80}
                placeholder="Ejemplo: Ana Torres"
                className="input"
                autoComplete="name"
              />
              {initialName && (
                <span className="field-hint">
                  Te registraste antes como {initialName}. Puedes cambiar el nombre.
                </span>
              )}
            </label>

            <label className="field">
              Correo (opcional)
              <input
                type="email"
                value={studentEmail}
                onChange={(event) => setStudentEmail(event.target.value)}
                maxLength={160}
                placeholder="ana@example.com"
                className="input"
                autoComplete="email"
                inputMode="email"
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              disabled={busy || !studentName.trim()}
              className="btn primary block"
            >
              {busy ? "Preparando..." : "Comenzar →"}
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
