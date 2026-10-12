import ManageIcon from "./ManageIcon.jsx";

export function ActivityCard({ activity, onEdit, onShare, onToggle, onDelete }) {
  return (
    <article className="grid grid-cols-[5px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-[#e4ebdf] bg-white shadow-[0_5px_20px_rgba(0,76,51,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,76,51,0.08)] sm:grid-cols-[6px_minmax(0,1fr)_auto] sm:gap-[18px] sm:py-[18px] sm:pr-5 lg:grid-cols-[7px_minmax(0,1fr)_auto] lg:gap-x-3 lg:py-4 lg:pr-4 lg:shadow-[0_12px_28px_rgba(0,76,51,0.07)] lg:hover:shadow-[0_18px_36px_rgba(0,76,51,0.12)]">
      <span className="row-span-2 min-h-full rounded-r-lg lg:row-span-1" style={{ backgroundColor: activity.color }} aria-hidden="true" />

      <div className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 px-3 py-3 sm:flex sm:min-w-0 sm:items-center sm:gap-[15px] sm:p-0 lg:min-h-[64px]">
        <span className="row-span-2 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[1.05rem] sm:h-[58px] sm:w-[58px] sm:rounded-[18px] sm:text-xl" style={{ backgroundColor: `${activity.color}22`, color: activity.color }}>
          <ManageIcon name={activity.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
        </span>
        <div className="contents sm:block sm:min-w-0">
          <h3 className="col-start-2 row-start-1 min-w-0 truncate text-[.9rem] font-extrabold leading-[1.3] sm:text-base">{activity.title}</h3>
          <p className="col-start-2 col-span-2 row-start-2 truncate text-xs text-[#718078] sm:mt-[5px] sm:text-[.83rem]">{activity.description || "Actividad de aprendizaje"}</p>
          <span className={`col-start-3 row-start-1 inline-flex items-center justify-self-end gap-[7px] whitespace-nowrap text-[.68rem] font-extrabold sm:mt-[9px] sm:text-xs ${activity.active ? "text-[#117a3d]" : "text-[#718078]"}`}>
            <span className={`h-[9px] w-[9px] rounded-full ${activity.active ? "animate-pulse bg-[#1fae5a] motion-reduce:animate-none" : "bg-[#b9c2bb]"}`} />
            {activity.active ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      <div className="col-start-2 mx-3 mb-3 grid grid-cols-4 overflow-hidden rounded-xl border border-[#e4ebdf] bg-[#f7faf4] sm:mx-0 sm:mb-0 sm:flex sm:items-center sm:justify-end sm:gap-2 sm:overflow-visible sm:rounded-xl sm:border sm:bg-[#f7faf4] sm:p-1 lg:col-start-3 lg:row-start-1 lg:gap-1.5 lg:my-2">
        <button type="button" onClick={() => onEdit(activity)} title="Editar actividad" aria-label={`Editar ${activity.title}`} className="grid min-h-10 place-items-center text-[#006b4b] transition hover:bg-[#edf6e9] active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#006b4b] sm:flex sm:h-9 sm:min-h-9 sm:gap-2 sm:rounded-lg sm:px-2.5 sm:text-xs sm:font-bold lg:w-9 lg:justify-center lg:px-0">
          <ManageIcon name="edit" /> <span className="hidden sm:inline lg:hidden">Editar</span>
        </button>
        <button type="button" onClick={() => onShare(activity)} title="Compartir actividad" aria-label={`Compartir ${activity.title}`} className="grid min-h-10 place-items-center border-l border-[#e4ebdf] text-[#665700] transition hover:bg-[#fff7d7] active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#806800] sm:flex sm:h-9 sm:min-h-9 sm:gap-2 sm:rounded-lg sm:border-0 sm:bg-[#fff7d7] sm:px-2.5 sm:text-xs sm:font-bold lg:w-9 lg:justify-center lg:px-0 lg:bg-transparent">
          <ManageIcon name="link" /> <span className="hidden sm:inline lg:hidden">Compartir</span>
        </button>
        <button type="button" onClick={() => onToggle(activity)} title={activity.active ? "Desactivar actividad" : "Activar actividad"} aria-label={`${activity.active ? "Desactivar" : "Activar"} ${activity.title}`} className={`grid min-h-10 place-items-center border-l border-[#e4ebdf] transition active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#006b4b] sm:flex sm:h-9 sm:min-h-9 sm:gap-2 sm:rounded-lg sm:border-0 sm:px-2.5 sm:text-xs sm:font-bold lg:w-9 lg:justify-center lg:px-0 ${activity.active ? "text-[#006b4b] hover:bg-[#edf6e9] sm:bg-white lg:bg-transparent" : "text-[#0d7a3e] hover:bg-[#e2f3e8] sm:bg-[#eef8f1] lg:bg-transparent"}`}>
          <ManageIcon name={activity.active ? "pause" : "play"} /> <span className="hidden sm:inline lg:hidden">{activity.active ? "Desactivar" : "Activar"}</span>
        </button>
        <button type="button" onClick={() => onDelete(activity)} title="Eliminar actividad" aria-label={`Eliminar ${activity.title}`} className="grid min-h-10 place-items-center border-l border-[#e4ebdf] text-[#b83a34] transition hover:bg-[#fff0ef] active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#b83a34] sm:flex sm:h-9 sm:min-h-9 sm:gap-2 sm:rounded-lg sm:border-0 sm:px-2.5 sm:text-xs sm:font-bold lg:w-9 lg:justify-center lg:px-0 lg:hover:bg-[#fff0ef]">
          <ManageIcon name="trash" /> <span className="hidden sm:inline lg:hidden">Eliminar</span>
        </button>
      </div>
    </article>
  );
}

export default ActivityCard;