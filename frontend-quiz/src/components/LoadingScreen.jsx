import AppShell from "@/components/AppShell";

export default function LoadingScreen() {
  return (
    <AppShell>
      <div className="screen-center">
        <div className="skeleton-card" aria-busy="true" aria-label="Cargando actividad">
          <div className="skeleton-top" />
          <div className="skeleton-body">
            <div className="skeleton-line skeleton-badge" />
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-sub" />
            <div className="skeleton-option" />
            <div className="skeleton-option" />
            <div className="skeleton-option" />
            <div className="skeleton-option" />
          </div>
          <div className="skeleton-footer">
            <div className="skeleton-line" style={{ width: 110, height: 12 }} />
            <div className="skeleton-line skeleton-pill" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
