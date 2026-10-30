import ManageIcon from "@/shared/components/icons/ManageIcon.jsx";

export function ActivityDetailsCard({ activity, saveError, onEdit }) {
  return (
    <section aria-labelledby="activity-details-title" className="mb-8 rounded-2xl border border-[#e4ebdf] bg-white p-4 shadow-[0_8px_24px_rgba(0,76,51,0.05)] sm:p-6">
      {saveError && <p role="alert" className="mb-4 rounded-lg bg-[#fff0ef] px-3 py-2 text-sm font-semibold text-[#a8322c]">{saveError}</p>}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl sm:h-16 sm:w-16" style={{ backgroundColor: `${activity.color}22`, color: activity.color }}>
            <ManageIcon name={activity.icon} className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            <p id="activity-details-title" className="mb-1 text-xs font-extrabold uppercase text-[#718078]">Información de la actividad</p>
            <h1 className="break-words text-xl font-black text-[#00583f] sm:text-2xl">{activity.title}</h1>
            <p className="mt-1 max-w-[680px] text-sm leading-relaxed text-[#718078]">{activity.description || "Sin descripción"}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-[#53665b]">
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: activity.color }} />
                {activity.color}
              </span>
              <span className={`inline-flex items-center gap-2 ${activity.active ? "text-[#117a3d]" : "text-[#718078]"}`}>
                <span className={`h-2 w-2 rounded-full ${activity.active ? "bg-[#1fae5a]" : "bg-[#b9c2bb]"}`} />
                {activity.active ? "Activa" : "Inactiva"}
              </span>
            </div>
            <div className="mt-4 rounded-xl border border-dashed border-[#cfe0c9] bg-[#f7faf4] p-3">
              <p className="text-[.7rem] font-extrabold uppercase tracking-wide text-[#718078]">Código de la actividad</p>
              <p className="mt-1 break-all font-mono text-sm font-bold text-[#00583f]">{activity.code}</p>
              <p className="mt-1 break-all text-xs text-[#718078]">{activity.link}</p>
            </div>
          </div>
        </div>
        <button type="button" onClick={onEdit} className="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-[#dce8d7] bg-[#f7faf4] px-4 text-sm font-extrabold text-[#006b4b] transition hover:bg-[#edf6e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b4b] sm:w-auto">
          <ManageIcon name="edit" />
          Editar información
        </button>
      </div>
    </section>
  );
}

export default ActivityDetailsCard;
