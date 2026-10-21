import { useState } from "react";

export default function StartScreen({ activity, onStart, busy, error, initialName = "" }) {
  const [studentName, setStudentName] = useState(initialName);
  const [studentEmail, setStudentEmail] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!studentName.trim() || busy) return;
    onStart({ studentName: studentName.trim(), studentEmail: studentEmail.trim() });
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--card)] p-8 shadow-sm">
        <span className="mb-4 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[var(--brand)]">
          {activity.totalQuestions} preguntas
        </span>
        <h1 className="mb-2 text-2xl font-bold">{activity.title}</h1>
        {activity.description && (
          <p className="mb-6 text-sm text-[var(--muted)]">{activity.description}</p>
        )}

        {activity.active === false && (
          <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            Esta actividad está marcada como inactiva, pero puedes abrirla.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Tu nombre
            <input
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              required
              maxLength={80}
              placeholder="Ejemplo: Ana Torres"
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-normal outline-none focus:border-[var(--brand)]"
            />
            {initialName && (
              <span className="text-xs font-normal text-[var(--muted)]">
                Te registraste antes como {initialName}. Puedes cambiar el nombre.
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold">
            Correo (opcional)
            <input
              type="email"
              value={studentEmail}
              onChange={(event) => setStudentEmail(event.target.value)}
              maxLength={160}
              placeholder="ana@example.com"
              className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-normal outline-none focus:border-[var(--brand)]"
            />
          </label>

          {error && <p className="text-sm font-semibold text-[var(--red)]">{error}</p>}

          <button
            type="submit"
            disabled={busy || !studentName.trim()}
            className="rounded-xl bg-[var(--brand)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--brand-d)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Preparando..." : "Comenzar"}
          </button>
        </form>
      </div>
    </div>
  );
}
