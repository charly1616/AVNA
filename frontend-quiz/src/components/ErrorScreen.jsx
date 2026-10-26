import AppShell from "@/components/AppShell";

export default function ErrorScreen({ message, onRetry, onBack }) {
  return (
    <AppShell badge="Error">
      <div className="screen-center">
        <div className="panel panel-center" role="alert">
          <div className="panel-icon bad" aria-hidden="true">
            !
          </div>
          <h1 className="panel-title">No pudimos cargar la actividad</h1>
          <p className="panel-sub">{message}</p>

          <div className="btn-row">
            <button type="button" onClick={onRetry} className="btn primary block">
              Reintentar
            </button>
            {onBack && (
              <button type="button" onClick={onBack} className="btn ghost block">
                Probar otro código
              </button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
