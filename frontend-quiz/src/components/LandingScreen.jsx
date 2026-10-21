import { useState } from "react";

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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--card)] p-8 shadow-sm">
        <span className="mb-4 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[var(--brand)]">
          Quiz
        </span>
        <h1 className="mb-2 text-2xl font-bold">Abre una actividad</h1>
        <p className="mb-6 text-sm text-[var(--muted)]">
          Escribe el código o el nombre de la actividad que te compartieron.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Código de la actividad
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Ejemplo: quiz-de-fundamentos-frontend"
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 font-mono text-sm font-normal outline-none focus:border-[var(--brand)]"
            />
          </label>

          <button
            type="submit"
            disabled={!code.trim()}
            className="rounded-xl bg-[var(--brand)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--brand-d)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Abrir actividad
          </button>
        </form>
      </div>
    </div>
  );
}
