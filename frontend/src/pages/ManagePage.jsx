import { useEffect, useState } from "react";
import ActivityCard from "../components/manage/ActivityCard.jsx";
import ActivityEditModal from "../components/manage/ActivityEditModal.jsx";
import ManageIcon from "../components/manage/ManageIcon.jsx";
import TeacherHeader from "../components/layout/TeacherHeader.jsx";
import PageDecorations from "../components/layout/PageDecorations.jsx";

const initialActivities = [
  { id: 1, title: "Exploradores de palabras", description: "Juegos para ampliar vocabulario", color: "#087b55", icon: "spell", active: true, link: "https://avna.example/actividades/exploradores-de-palabras" },
  { id: 2, title: "Reto matemático", description: "Desafíos para pensar y resolver", color: "#f4c928", icon: "calculator", active: true, link: "https://avna.example/actividades/reto-matematico" },
  { id: 3, title: "Laboratorio creativo", description: "Experimenta y crea algo nuevo", color: "#91c83e", icon: "palette", active: true, link: "https://avna.example/actividades/laboratorio-creativo" },
  { id: 4, title: "Comprensión lectora", description: "Lee, interpreta y descubre", color: "#8bc9a2", icon: "book", active: true, link: "https://avna.example/actividades/comprension-lectora" },
  { id: 5, title: "Misión sistema solar", description: "Explora planetas, órbitas y curiosidades del espacio", color: "#4779b8", icon: "brain", active: true, link: "https://avna.example/actividades/mision-sistema-solar" },
  { id: 6, title: "Palabras viajeras", description: "Construye frases y descubre nuevas palabras", color: "#db7659", icon: "spell", active: false, link: "https://avna.example/actividades/palabras-viajeras" },
  { id: 7, title: "Pequeños científicos", description: "Prueba hipótesis con experimentos sencillos", color: "#7e65a8", icon: "flask", active: true, link: "https://avna.example/actividades/pequenos-cientificos" },
  { id: 8, title: "Desafío de patrones", description: "Encuentra la regla y completa cada secuencia", color: "#d7a72e", icon: "puzzle", active: true, link: "https://avna.example/actividades/desafio-de-patrones" },
  { id: 9, title: "Cuentos en equipo", description: "Crea una historia entre todos, paso a paso", color: "#3e9a82", icon: "book", active: false, link: "https://avna.example/actividades/cuentos-en-equipo" },
  { id: 10, title: "Ideas brillantes", description: "Preguntas para observar, imaginar y compartir", color: "#e5a943", icon: "bulb", active: true, link: "https://avna.example/actividades/ideas-brillantes" },
  { id: 11, title: "Fracciones en acción", description: "Resuelve situaciones cotidianas con fracciones", color: "#4481a5", icon: "calculator", active: true, link: "https://avna.example/actividades/fracciones-en-accion" },
  { id: 12, title: "Taller de inventos", description: "Diseña una solución y presenta tu prototipo", color: "#bf668e", icon: "palette", active: false, link: "https://avna.example/actividades/taller-de-inventos" },
];

export function ManagePage() {
  const [activities, setActivities] = useState(initialActivities);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingActivity(null);
  };

  const openNewActivity = () => {
    setEditingActivity(null);
    setModalOpen(true);
  };

  const openEditActivity = (activity) => {
    setEditingActivity(activity);
    setModalOpen(true);
  };

  const saveActivity = (values) => {
    if (editingActivity) {
      setActivities((current) => current.map((item) => item.id === editingActivity.id ? { ...item, ...values } : item));
      setToast("Actividad actualizada correctamente.");
      closeModal();
      return;
    }

    const slug = values.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const activity = {
      id: Date.now(),
      ...values,
      active: true,
      link: `https://avna.example/actividades/${slug || "nueva-actividad"}`,
    };
    setActivities((current) => [activity, ...current]);
    setToast("Nueva actividad creada.");
    closeModal();
  };

  const toggleActivity = (activity) => {
    const active = !activity.active;
    setActivities((current) => current.map((item) => item.id === activity.id ? { ...item, active } : item));
    setToast(active ? "Actividad activada." : "Actividad desactivada.");
  };

  const deleteActivity = (activity) => {
    const confirmed = window.confirm(`¿Eliminar "${activity.title}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;
    setActivities((current) => current.filter((item) => item.id !== activity.id));
    setToast("Actividad eliminada.");
  };

  const shareActivity = async (activity) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: activity.title, text: `Mira esta actividad: ${activity.title}`, url: activity.link });
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(activity.link);
        setToast("Enlace copiado al portapapeles.");
      } else {
        window.prompt("Copia el enlace de la actividad:", activity.link);
      }
    } catch (error) {
      if (error?.name !== "AbortError") window.prompt("Copia el enlace de la actividad:", activity.link);
    }
  };

  return (
    <>
      <main className="relative isolate h-[100svh] overflow-x-clip overflow-y-auto overscroll-y-contain bg-[#fbfbf6] text-[#124d3b] [background-image:radial-gradient(circle_at_0%_0%,#e1efdc_0,transparent_92%)]">
        <PageDecorations footer="waves" />
        <TeacherHeader sticky />

        <div className="mx-auto w-[calc(100%-40px)] max-w-[1440px] pb-[150px] pt-[calc(24px+env(safe-area-inset-top))] sm:w-[calc(100%-64px)] sm:pt-[30px] 2xl:w-[calc(100%-120px)]">
          <header className="mb-[22px] flex items-center justify-between gap-[14px] sm:mb-[30px] sm:items-end sm:gap-6 lg:mb-10">
            <div className="min-w-0">
              <h1 className="text-[1.85rem] font-black leading-[1.1] text-[#00583f] sm:text-[clamp(2rem,4vw,3rem)]">Diseñar actividades</h1>
              <p className="mt-3 hidden leading-relaxed text-[#718078] sm:block">Administra, personaliza y comparte tus actividades de aprendizaje.</p>
            </div>
            <button type="button" onClick={openNewActivity} aria-label="Nueva actividad" className="group inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#006b4b] px-0 font-extrabold text-white shadow-[0_8px_20px_rgba(0,107,75,0.12)] transition hover:-translate-y-0.5 hover:bg-[#00583f] active:scale-[.97] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#91c83e] sm:h-[52px] sm:w-auto sm:px-6">
              <ManageIcon name="plus" className="h-5 w-5" />
              <span className="sr-only sm:not-sr-only">Nueva actividad</span>
            </button>
          </header>

          <div className="mb-3 flex items-center justify-between gap-4 sm:mb-[15px]">
            <div className="flex items-center gap-3">
              <h2 className="text-[1.05rem] font-extrabold sm:text-[1.15rem]">Actividades creadas</h2>
              <span aria-live="polite" className="inline-flex h-[28px] min-w-[28px] items-center justify-center rounded-full bg-[#ffcf32] px-[9px] text-[.85rem] font-black text-[#00583f] sm:h-[30px] sm:min-w-[30px]">{activities.length}</span>
            </div>
            <span className="hidden text-[.82rem] text-[#718078] sm:inline">Administra tus actividades</span>
          </div>

          {activities.length ? (
            <section aria-label="Actividades creadas" className="grid gap-[14px] lg:grid-cols-2 lg:gap-5">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={openEditActivity}
                  onShare={shareActivity}
                  onToggle={toggleActivity}
                  onDelete={deleteActivity}
                />
              ))}
            </section>
          ) : (
            <section className="rounded-[22px] border border-dashed border-[#c9ddc4] bg-white px-5 py-10 text-center">
              <ManageIcon name="folder" className="mx-auto h-8 w-8 text-[#91c83e]" />
              <h3 className="mt-3 font-extrabold">Aún no tienes actividades</h3>
              <p className="mt-1 text-sm text-[#718078]">Crea tu primera actividad para verla aquí.</p>
            </section>
          )}
        </div>

      </main>

      <ActivityEditModal open={modalOpen} activity={editingActivity} onClose={closeModal} onSave={saveActivity} />

      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-[calc(18px+env(safe-area-inset-bottom))] left-1/2 z-50 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-[14px] bg-[#00583f] px-5 py-[13px] text-center text-sm font-bold text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

export default ManagePage;