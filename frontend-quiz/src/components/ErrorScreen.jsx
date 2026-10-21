export default function ErrorScreen({ message, onRetry, onBack }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--card)] p-8 text-center shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">No pudimos cargar la actividad</h1>
        <p className="mb-6 text-sm text-[var(--muted)]">{message}</p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="w-full rounded-xl bg-[var(--brand)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--brand-d)]"
          >
            Reintentar
          </button>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-full rounded-xl border border-[var(--line)] px-6 py-3 font-semibold transition hover:bg-[#f7faf4]"
            >
              Probar otro código
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
