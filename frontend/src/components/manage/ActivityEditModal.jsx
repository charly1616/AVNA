import { useEffect, useRef, useState } from "react";
import ManageIcon from "./ManageIcon.jsx";

const colors = ["#087b55", "#91c83e", "#8bc9a2", "#f4c928", "#e06a3a", "#1e6fbf", "#7a4fb5", "#e2526e"];
const icons = [
  { value: "book", label: "Libro" },
  { value: "spell", label: "Palabras" },
  { value: "calculator", label: "Matemáticas" },
  { value: "palette", label: "Creatividad" },
  { value: "bulb", label: "Ideas" },
  { value: "flask", label: "Ciencias" },
  { value: "puzzle", label: "Rompecabezas" },
  { value: "brain", label: "Pensamiento" },
];

export function ActivityEditModal({ open, activity, onClose, onSave, saving = false }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(colors[0]);
  const [icon, setIcon] = useState("book");
  const titleRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    setTitle(activity?.title || "");
    setDescription(activity?.description || "");
    setColor(activity?.color || colors[0]);
    setIcon(activity?.icon || "book");
    titleRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, activity, onClose]);

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onSave({ title: trimmedTitle, description: description.trim(), color, icon });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[#002d1f]/50 p-0 backdrop-blur-[5px] sm:items-center sm:p-[18px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="activity-modal-title" className="flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-[24px] bg-[#fbfbf5] shadow-[0_25px_70px_rgba(0,0,0,0.2)] sm:max-w-[460px] sm:rounded-[25px]">
        <header className="relative flex shrink-0 justify-between gap-4 border-b border-[#e4ebdf] px-5 pb-4 pt-6 sm:mb-2 sm:border-0 sm:px-[25px] sm:pt-[25px]">
          <span aria-hidden="true" className="absolute left-1/2 top-[9px] h-[5px] w-11 -translate-x-1/2 rounded-full bg-[#d5e2cf] sm:hidden" />
          <div>
            <h2 id="activity-modal-title" className="text-xl font-black text-[#00583f]">{activity ? "Editar actividad" : "Nueva actividad"}</h2>
            <p className="mt-1 text-sm text-[#718078]">Personaliza la apariencia de tu actividad.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#edf6e9] text-[#006b4b] transition hover:bg-[#e0efda] active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#91c83e]">
            <ManageIcon name="close" className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-4 sm:px-[25px] sm:pt-0">
          <div className="flex-1">
            <div className="mb-[17px]">
              <label htmlFor="activity-title" className="mb-2 block text-sm font-extrabold text-[#124d3b]">Título de la actividad</label>
              <input ref={titleRef} id="activity-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} placeholder="Ej. Exploradores de palabras" required className="min-h-[46px] w-full rounded-xl border border-[#dbe5d7] bg-white px-3 text-sm text-[#124d3b] outline-none transition placeholder:text-[#99a49d] focus:border-[#006b4b] focus:ring-4 focus:ring-[#006b4b]/10" />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
              <fieldset className="mb-[17px] min-w-0">
                <legend className="mb-3 text-sm font-extrabold text-[#124d3b]">Color</legend>
                <div className="flex flex-wrap gap-3">
                  {colors.map((swatch) => (
                    <label key={swatch} className={`relative h-[38px] w-[38px] cursor-pointer rounded-full transition hover:scale-105 ${color === swatch ? "ring-[3px] ring-white ring-offset-[3px]" : ""}`} style={color === swatch ? { boxShadow: `0 0 0 6px ${swatch}` } : undefined}>
                      <input className="peer sr-only" type="radio" name="activity-color" value={swatch} checked={color === swatch} onChange={() => setColor(swatch)} aria-label={`Color ${swatch}`} />
                      <span className="grid h-full w-full place-items-center rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]" style={{ backgroundColor: swatch }}>
                        {color === swatch && <ManageIcon name="check" className="h-4 w-4 text-white drop-shadow" />}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mb-[17px] min-w-0">
                <legend className="mb-3 text-sm font-extrabold text-[#124d3b]">Icono</legend>
                <div className="grid grid-cols-4 gap-2">
                  {icons.map((option) => (
                    <label key={option.value} className={`relative grid h-11 cursor-pointer place-items-center rounded-xl border transition ${icon === option.value ? "border-[#006b4b] bg-[#eef6ea] text-[#006b4b] ring-1 ring-[#006b4b]" : "border-[#e4ebdf] bg-white text-[#718078] hover:bg-[#f5f8f2]"}`}>
                      <input className="peer sr-only" type="radio" name="activity-icon" value={option.value} checked={icon === option.value} onChange={() => setIcon(option.value)} aria-label={option.label} />
                      <ManageIcon name={option.value} className="h-[19px] w-[19px]" />
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="mb-[17px]">
              <label htmlFor="activity-description" className="mb-2 block text-sm font-extrabold text-[#124d3b]">Descripción breve <span className="font-normal text-[#718078]">(opcional)</span></label>
              <input id="activity-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={100} placeholder="Ej. Juegos para ampliar vocabulario" className="min-h-[46px] w-full rounded-xl border border-[#dbe5d7] bg-white px-3 text-sm text-[#124d3b] outline-none transition placeholder:text-[#99a49d] focus:border-[#006b4b] focus:ring-4 focus:ring-[#006b4b]/10" />
            </div>
          </div>

          <footer className="sticky bottom-0 mt-2 flex shrink-0 justify-end gap-2 bg-[#fbfbf5] py-4 pb-[calc(16px+env(safe-area-inset-bottom))] sm:pb-6">
            <button type="button" onClick={onClose} disabled={saving} className="min-h-12 flex-1 rounded-full border border-[#e4ebdf] bg-white px-[18px] font-extrabold text-[#006b4b] transition hover:bg-[#f2f7ef] active:scale-[.97] disabled:cursor-wait disabled:opacity-60 sm:flex-none">Cancelar</button>
            <button type="submit" disabled={saving} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#006b4b] px-5 font-extrabold text-white shadow-[0_8px_20px_rgba(0,107,75,0.12)] transition hover:bg-[#00583f] active:scale-[.97] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#91c83e] disabled:cursor-wait disabled:opacity-60 sm:flex-none">
              <ManageIcon name="check" /> {saving ? "Guardando..." : "Guardar"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default ActivityEditModal;