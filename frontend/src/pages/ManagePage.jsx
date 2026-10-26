import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ActivityCard from "../components/manage/ActivityCard.jsx";
import ActivityEditModal from "../components/manage/ActivityEditModal.jsx";
import ManageIcon from "../components/manage/ManageIcon.jsx";
import TeacherHeader from "../components/layout/TeacherHeader.jsx";
import PageDecorations from "../components/layout/PageDecorations.jsx";
import activityService from "../api/activity.service.js";

export function ManagePage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    activityService.list({ signal: controller.signal })
      .then(({ activities: loadedActivities }) => {
        setActivities(loadedActivities);
        setLoadError("");
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setLoadError(error.response?.data?.message || "No se pudieron cargar las actividades.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const closeModal = () => {
    setModalOpen(false);
  };

  const openNewActivity = () => {
    setModalOpen(true);
  };

  const openEditActivity = (activity) => {
    navigate(`/manage/${encodeURIComponent(activity.id)}/edit`);
  };

  const saveActivity = async (values) => {
    setIsSaving(true);
    try {
      const activity = await activityService.create({
        ...values,
        active: true,
      });
      setActivities((current) => [activity, ...current]);
      setToast("Nueva actividad creada.");
      closeModal();
    } catch (error) {
      setToast(error.response?.data?.message || "No se pudo guardar la actividad.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActivity = async (activity) => {
    const active = !activity.active;
    try {
      const updatedActivity = await activityService.update(activity.id, { active });
      setActivities((current) => current.map((item) => item.id === updatedActivity.id ? updatedActivity : item));
      setToast(active ? "Actividad activada." : "Actividad desactivada.");
    } catch (error) {
      setToast(error.response?.data?.message || "No se pudo cambiar el estado de la actividad.");
    }
  };

  const deleteActivity = async (activity) => {
    const confirmed = window.confirm(`¿Eliminar "${activity.title}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;
    try {
      await activityService.remove(activity.id);
      setActivities((current) => current.filter((item) => item.id !== activity.id));
      setToast("Actividad eliminada.");
    } catch (error) {
      setToast(error.response?.data?.message || "No se pudo eliminar la actividad.");
    }
  };

  const copyText = async (text, message) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setToast(message);
      } else {
        window.prompt("Copia el texto:", text);
      }
    } catch {
      window.prompt("Copia el texto:", text);
    }
  };

  /**
   * The link button copies only the code: that code is enough to open the
   * quiz, on the code box of the quiz app or on /a/<code>.
   */
  const shareActivity = async (activity) => {
    await copyText(activity.code, `Código "${activity.code}" copiado.`);
  };

  return (
    <>
      <main className="relative isolate h-[100svh] overflow-x-clip overflow-y-auto overscroll-y-contain bg-[#fbfbf6] text-[#124d3b] [background-image:radial-gradient(circle_at_0%_0%,#e1efdc_0,transparent_22%)]">
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

          {isLoading ? (
            <section role="status" className="rounded-2xl border border-[#e4ebdf] bg-white/80 px-5 py-10 text-center text-sm font-semibold text-[#718078]">
              Cargando actividades...
            </section>
          ) : activities.length ? (
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
          ) : loadError ? (
            <section role="alert" className="rounded-2xl border border-[#e4ebdf] bg-white px-5 py-10 text-center">
              <p className="font-extrabold">{loadError}</p>
              <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-4 rounded-full bg-[#006b4b] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#00583f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#91c83e]">
                Reintentar
              </button>
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

      <ActivityEditModal open={modalOpen} onClose={closeModal} onSave={saveActivity} saving={isSaving} />

      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-[calc(18px+env(safe-area-inset-bottom))] left-1/2 z-50 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-[14px] bg-[#00583f] px-5 py-[13px] text-center text-sm font-bold text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

export default ManagePage;