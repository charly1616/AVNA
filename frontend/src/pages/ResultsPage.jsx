import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";

import activityService from "../api/activity.service.js";
import resultsService from "../api/results.service.js";
import ManageIcon from "../components/manage/ManageIcon.jsx";
import PageDecorations from "../components/layout/PageDecorations.jsx";
import TeacherHeader from "../components/layout/TeacherHeader.jsx";
import AttemptDetailModal from "../components/results/AttemptDetailModal.jsx";
import AttemptsTable from "../components/results/AttemptsTable.jsx";
import DistributionChart from "../components/results/DistributionChart.jsx";
import QuestionPerformance from "../components/results/QuestionPerformance.jsx";
import ResultsIcon from "../components/results/ResultsIcon.jsx";
import StatCard from "../components/results/StatCard.jsx";
import TypePerformance from "../components/results/TypePerformance.jsx";
import { formatDuration } from "../utils/format.js";

const errorText = (error, fallback) =>
  error?.response?.data?.message || fallback;

function ResultsSkeleton() {
  return (
    <div role="status" aria-label="Cargando resultados" className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[132px] animate-pulse rounded-2xl border border-[#e4ebdf] bg-white/80"
          />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-[330px] animate-pulse rounded-2xl border border-[#e4ebdf] bg-white/80" />
        <div className="h-[330px] animate-pulse rounded-2xl border border-[#e4ebdf] bg-white/80" />
      </div>
      <div className="h-[380px] animate-pulse rounded-2xl border border-[#e4ebdf] bg-white/80" />
    </div>
  );
}

export function ResultsPage() {
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState("");
  const [activitiesKey, setActivitiesKey] = useState(0);

  const [selectedId, setSelectedId] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [dashboardKey, setDashboardKey] = useState(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [updatingQuestionId, setUpdatingQuestionId] = useState("");
  const [detailUpdateError, setDetailUpdateError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setActivitiesLoading(true);
    setActivitiesError("");

    activityService
      .list({ limit: 100, signal: controller.signal })
      .then(({ activities: loaded }) => {
        setActivities(loaded);
        setSelectedId((current) => {
          if (current && loaded.some((activity) => activity.id === current)) {
            return current;
          }
          return loaded[0]?.id ?? "";
        });
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setActivitiesError(
            errorText(error, "No se pudieron cargar las actividades.")
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setActivitiesLoading(false);
      });

    return () => controller.abort();
  }, [activitiesKey]);

  useEffect(() => {
    if (!selectedId) {
      setDashboard(null);
      return undefined;
    }

    const controller = new AbortController();
    setDashboardLoading(true);
    setDashboardError("");

    resultsService
      .get(selectedId, { signal: controller.signal })
      .then((loaded) => {
        setDashboard(loaded);
        setDashboardError("");
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setDashboard(null);
          setDashboardError(
            errorText(error, "No se pudieron cargar los resultados del examen.")
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setDashboardLoading(false);
      });

    return () => controller.abort();
  }, [selectedId, dashboardKey]);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setDetail(null);
    setDetailError("");
    setDetailUpdateError("");
  }, []);

  const openAttempt = useCallback(
    async (attemptId) => {
      setDetailOpen(true);
      setDetail(null);
      setDetailError("");
      setDetailUpdateError("");
      setUpdatingQuestionId("");
      setDetailLoading(true);

      try {
        const loaded = await resultsService.getAttempt(selectedId, attemptId);
        setDetail(loaded);
      } catch (error) {
        setDetailError(
          errorText(error, "No se pudo cargar el detalle del intento.")
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [selectedId]
  );

  const updateCorrectness = useCallback(
    async (questionId, isCorrect) => {
      if (!detail?.attempt?.id) return;

      setUpdatingQuestionId(questionId);
      setDetailUpdateError("");

      try {
        const updated = await resultsService.updateAnswerCorrectness(
          selectedId,
          detail.attempt.id,
          questionId,
          isCorrect
        );
        setDetail(updated);
        setDashboardKey((key) => key + 1);
      } catch (error) {
        setDetailUpdateError(
          errorText(error, "No se pudo actualizar la corrección de la pregunta.")
        );
      } finally {
        setUpdatingQuestionId("");
      }
    },
    [detail, selectedId]
  );

  const selectedActivity = activities.find((activity) => activity.id === selectedId);
  const summary = dashboard?.summary;
  const hasAttempts = (summary?.totalAttempts ?? 0) > 0;

  return (
    <>
      <main className="relative isolate h-[100svh] overflow-x-clip overflow-y-auto overscroll-y-contain bg-[#fbfbf6] text-[#124d3b] [background-image:radial-gradient(circle_at_0%_0%,#e1efdc_0,transparent_22%)]">
        <PageDecorations footer="waves" />
        <TeacherHeader sticky />

        <div className="mx-auto w-[calc(100%-40px)] max-w-[1440px] pb-[150px] pt-[calc(24px+env(safe-area-inset-top))] sm:w-[calc(100%-64px)] sm:pt-[30px] 2xl:w-[calc(100%-120px)]">
          <header className="mb-6 flex flex-col gap-5 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#e6f3e1] px-3 py-1 text-[.68rem] font-black uppercase tracking-[0.14em] text-[#006b4b]">
                <ResultsIcon name="chart" className="h-3.5 w-3.5" />
                Panel docente
              </span>
              <h1 className="mt-3 text-[1.9rem] font-black leading-[1.05] text-[#00583f] sm:text-[clamp(2.1rem,4vw,3rem)]">
                Resultados
              </h1>
              <p className="mt-2 max-w-[620px] text-sm leading-relaxed text-[#718078] sm:text-[.95rem]">
                Selecciona un examen y revisa el desempeño de tus estudiantes, las preguntas más difíciles y cada intento.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="min-w-0 sm:w-[300px]">
                <span className="mb-1.5 block text-[.68rem] font-extrabold uppercase tracking-[0.12em] text-[#718078]">
                  Examen
                </span>
                <select
                  value={selectedId}
                  onChange={(event) => setSelectedId(event.target.value)}
                  disabled={activitiesLoading || activities.length === 0}
                  className="h-12 w-full rounded-2xl border border-[#dce8d7] bg-white px-4 text-sm font-extrabold text-[#00583f] shadow-[0_5px_18px_rgba(0,76,51,0.04)] outline-none transition focus:border-[#91c83e] focus:ring-2 focus:ring-[#91c83e]/30 disabled:cursor-not-allowed disabled:text-[#9aa79f]"
                >
                  {activities.length === 0 && <option value="">Sin exámenes</option>}
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.title} · {activity.code}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => setDashboardKey((key) => key + 1)}
                disabled={!selectedId || dashboardLoading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#dce8d7] bg-white px-4 text-sm font-extrabold text-[#006b4b] shadow-[0_5px_18px_rgba(0,76,51,0.04)] transition hover:border-[#9bc53d] hover:bg-[#f6fbf2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#91c83e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ResultsIcon name="refresh" className={`h-4 w-4 ${dashboardLoading ? "animate-spin" : ""}`} />
                Actualizar
              </button>
            </div>
          </header>

          {activitiesLoading && <ResultsSkeleton />}

          {!activitiesLoading && activitiesError && (
            <section role="alert" className="rounded-2xl border border-[#f0d3cf] bg-white px-5 py-10 text-center">
              <p className="font-extrabold text-[#a9352f]">{activitiesError}</p>
              <button
                type="button"
                onClick={() => setActivitiesKey((key) => key + 1)}
                className="mt-4 rounded-full bg-[#006b4b] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#00583f]"
              >
                Reintentar
              </button>
            </section>
          )}

          {!activitiesLoading && !activitiesError && activities.length === 0 && (
            <section className="rounded-[22px] border border-dashed border-[#c9ddc4] bg-white px-5 py-12 text-center">
              <ManageIcon name="folder" className="mx-auto h-8 w-8 text-[#91c83e]" />
              <h2 className="mt-3 text-lg font-extrabold text-[#00583f]">Aún no tienes exámenes</h2>
              <p className="mt-1 text-sm text-[#718078]">
                Crea una actividad y compártela para empezar a recibir resultados.
              </p>
              <Link
                to="/manage"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#006b4b] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#00583f]"
              >
                Ir a actividades
                <ResultsIcon name="arrow" className="h-4 w-4" />
              </Link>
            </section>
          )}

          {!activitiesLoading && !activitiesError && activities.length > 0 && dashboardLoading && <ResultsSkeleton />}

          {!activitiesLoading && dashboardError && (
            <section role="alert" className="rounded-2xl border border-[#f0d3cf] bg-white px-5 py-10 text-center">
              <p className="font-extrabold text-[#a9352f]">{dashboardError}</p>
              <button
                type="button"
                onClick={() => setDashboardKey((key) => key + 1)}
                className="mt-4 rounded-full bg-[#006b4b] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#00583f]"
              >
                Reintentar
              </button>
            </section>
          )}

          {!dashboardLoading && !dashboardError && dashboard && (
            <div className="space-y-5">
              <section className="overflow-hidden rounded-2xl border border-[#e4ebdf] bg-white shadow-[0_5px_18px_rgba(0,76,51,0.04)]">
                <div className="grid sm:grid-cols-[6px_minmax(0,1fr)]">
                  <span className="hidden min-h-full sm:block" style={{ backgroundColor: dashboard.activity.color }} aria-hidden="true" />
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex min-w-0 items-center gap-4">
                      <span
                        className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
                        style={{
                          backgroundColor: `${dashboard.activity.color}20`,
                          color: dashboard.activity.color,
                        }}
                      >
                        <ManageIcon name={dashboard.activity.icon} className="h-7 w-7" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[.68rem] font-extrabold uppercase tracking-[0.12em] text-[#718078]">
                          Examen seleccionado
                        </p>
                        <h2 className="truncate text-lg font-black text-[#00583f] sm:text-xl">
                          {dashboard.activity.title}
                        </h2>
                        <p className="mt-1 text-sm text-[#718078]">
                          {dashboard.activity.description || "Actividad de aprendizaje"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#f4f8f0] px-3 py-1.5 font-mono text-xs font-extrabold text-[#17654d]">
                        {dashboard.activity.code}
                      </span>
                      <span className="rounded-full bg-[#e6f3e1] px-3 py-1.5 text-xs font-extrabold text-[#006b4b]">
                        {dashboard.summary.totalQuestions} preguntas
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section aria-label="Métricas principales" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <StatCard
                  label="Participantes"
                  value={summary.totalAttempts}
                  hint={`${summary.inProgressAttempts} en curso`}
                  icon="users"
                  tone="green"
                />
                <StatCard
                  label="Entregados"
                  value={summary.submittedAttempts}
                  hint={`${summary.completionRate}% de finalización`}
                  icon="check"
                  tone="lime"
                />
                <StatCard
                  label="Promedio"
                  value={`${summary.averagePercent}%`}
                  hint={`${summary.averageScore} de ${summary.totalQuestions} puntos`}
                  icon="average"
                  tone="green"
                />
                <StatCard
                  label="Aprobación"
                  value={`${summary.passRate}%`}
                  hint="Estudiantes con 70% o más"
                  icon="target"
                  tone="yellow"
                />
                <StatCard
                  label="Mejor puntaje"
                  value={`${summary.highestPercent}%`}
                  hint={`El más bajo: ${summary.lowestPercent}%`}
                  icon="trophy"
                  tone="yellow"
                />
                <StatCard
                  label="Tiempo medio"
                  value={formatDuration(summary.averageDurationMs)}
                  hint="Duración de los entregados"
                  icon="clock"
                  tone="rose"
                />
              </section>

              {!hasAttempts ? (
                <section className="rounded-2xl border border-dashed border-[#c9ddc4] bg-white px-5 py-12 text-center">
                  <ResultsIcon name="users" className="mx-auto h-9 w-9 text-[#b9cfb1]" />
                  <h2 className="mt-3 text-lg font-extrabold text-[#00583f]">Todavía no hay intentos</h2>
                  <p className="mt-1 text-sm text-[#718078]">
                    Comparte el código <span className="font-mono font-extrabold text-[#17654d]">{dashboard.activity.code}</span> para que tus estudiantes empiecen el examen.
                  </p>
                </section>
              ) : (
                <>
                  <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                    <DistributionChart
                      distribution={dashboard.distribution}
                      total={summary.submittedAttempts}
                    />
                    <TypePerformance types={dashboard.perType} />
                  </div>

                  <QuestionPerformance questions={dashboard.perQuestion} />

                  <AttemptsTable attempts={dashboard.attempts} onSelect={openAttempt} />
                </>
              )}
            </div>
          )}

          {!activitiesLoading && !dashboardLoading && !dashboardError && !dashboard && selectedActivity && (
            <ResultsSkeleton />
          )}
        </div>
      </main>

      <AttemptDetailModal
        open={detailOpen}
        loading={detailLoading}
        error={detailError}
        detail={detail}
        onClose={closeDetail}
        onUpdateCorrectness={updateCorrectness}
        updatingQuestionId={updatingQuestionId}
        updateError={detailUpdateError}
      />
    </>
  );
}

export default ResultsPage;
