import { useState } from "react";

import AppShell from "@/components/AppShell";
import { extractActivityCode } from "@/utils/activityCode";

export default function LandingScreen({ onOpen }) {
  const [code, setCode] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const cleanCode = extractActivityCode(code);
    if (!cleanCode) return;
    onOpen(cleanCode);
  }

  return (
    <AppShell badge="Quiz">
      <div className="screen-center">
        <div className="panel">
          <div className="landing-hero">
            <div className="landing-mark">✦</div>
            <div>
              <p>Simón Bolívar</p>
              <strong>AVNA Exam</strong>
            </div>
          </div>

          <div className="q-badge">
            <span className="dot" />
            Acceso
          </div>
          <h1 className="panel-title">Abre una actividad</h1>
          <p className="panel-sub">
            Escribe el código o el nombre de la actividad que te compartieron.
          </p>

          <form onSubmit={handleSubmit} className="form-stack">
            <label className="field">
              Código de la actividad
              <span className="input-wrap">
                <span className="input-icon" aria-hidden="true">
                  ⌘
                </span>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Ejemplo: quiz-de-fundamentos-frontend"
                  className="input mono"
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                />
              </span>
              <span className="field-hint">
                También puedes pegar el enlace completo de la actividad.
              </span>
            </label>

            <button
              type="submit"
              disabled={!code.trim()}
              className="btn primary block"
            >
              Abrir actividad →
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
