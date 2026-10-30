import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import TeacherHeader from "@/app/layouts/TeacherHeader.jsx";
import PageDecorations from "@/shared/components/layout/PageDecorations.jsx";
import { useActivities } from "@/features/activities/index.js";
import {
  useActivityResults,
  useAttemptResult,
  useUpdateAnswerCorrectness,
} from "@/features/results/index.js";
import AttemptDetailModal from "@/features/results/components/AttemptDetailModal.jsx";
import AttemptsTable from "@/features/results/components/AttemptsTable.jsx";
import DistributionChart from "@/features/results/components/DistributionChart.jsx";
import QuestionPerformance from "@/features/results/components/QuestionPerformance.jsx";
import StatCard from "@/features/results/components/StatCard.jsx";
import TypePerformance from "@/features/results/components/TypePerformance.jsx";
import ResultsIcon from "@/shared/components/icons/ResultsIcon.jsx";
import ManageIcon from "@/shared/components/icons/ManageIcon.jsx";
import { formatDuration } from "@/shared/lib/format.js";

const errorText = (error, fallback) =>
  error?.response?.data?.message || fallback;

export function ResultsPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState("");
  const [selectedAttemptId, setSelectedAttemptId] = useState("");
  const [dashboardKey, setDashboardKey] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [updatingQuestionId, setUpdatingQuestionId] = useState("");
  const [detailUpdateError, setDetailUpdateError] = useState("");

  const { data, isLoading: activitiesLoading, error: activitiesError, refetch: refetchActivities } =
    useActivities({ page: 1, limit: 100 });
  const activities = data?.activities ?? [];

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useActivityResults(selectedId);

  const {
    data: attemptDetail,
    isLoading: attemptLoading,
    error: attemptError,
  } = useAttemptResult(selectedId, selectedAttemptId);

  const updateAnswerCorrectness = useUpdateAnswerCorrectness();

  useEffect(() => {
    if (!selectedId) return;
    refetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, dashboardKey, refetchDashboard]);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setSelectedAttemptId("");
    setDetail(null);
    setDetailError("");
    setDetailUpdateError("");
    setUpdatingQuestionId("");
  }, []);

  const openAttempt = useCallback(
    (attemptId) => {
      setSelectedAttemptId(attemptId);
      setDetailOpen(true);
      setDetail(null);
      setDetailError("");
      setDetailUpdateError("");
      setUpdatingQuestionId("");
      setDetailLoading(true);
    },
    []
  );

  const updateCorrectness = useCallback(
    async (questionId, isCorrect) => {
      if (!detail?.attempt?.id) return;

      setUpdatingQuestionId(questionId);
      setDetailUpdateError("");

      try {
        await updateAnswerCorrectness.mutateAsync({
          activityId: selectedId,
          attemptId: detail.attempt.id,
          questionId,
          isCorrect,
        });
        setDashboardKey((key) => key + 1);
        setDetail((current) => ({
          ...current,
          result: current.result?.map((r) =>
            r.questionId === questionId ? { ...r, isCorrect } : r
          ),
        }));
      } catch (error) {
        setDetailUpdateError(
          errorText(error, "No se pudo actualizar la corrección de la pregunta.")
        );
      } finally {
        setUpdatingQuestionId("");
      }
    },
    [detail, selectedId, updateAnswerCorrectness]
  );

  const selectedActivity = activities.find((activity) => activity.id === selectedId);
  const summary = dashboard?.summary;
  const hasAttempts = (summary?.totalAttempts ?? 0) > 0;

  return (
    <>
      <main className="relative isolate h-[100svh] overflow-x-clip overflow-y-auto overscroll-y-contain bg-[#fbfbf6] text-[#005638] [background-image:radial-gradient(circle_at_0%_0%,#e1efdc_0,transparent_22%)]">
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
              <p className="font-extrabold text-[#a9352f]">{errorText(activitiesError, "No se pudieron cargar las actividades.")}</p>
              <button
                type="button"
                onClick={() => refetchActivities()}
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
              <p className="font-extrabold text-[#a9352f]">{errorText(dashboardError, "No se pudieron cargar los resultados del examen.")}</p>
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
                        style={{ backgroundColor: `${dashboard.activity.color}20`, color: dashboard.activity.color }}
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
                      <span className="inline-flex items-center gap-2 rounded-2xl border border-[#e4ebdf] bg-white px-4 py-2 text-sm font-bold text-[#006b4b]">
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
                    <DistributionChart distribution={dashboard.distribution} total={summary.submittedAttempts} />
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
        loading={attemptLoading}
        error={attemptError || detailError}
        detail={{ activity: selectedActivity, attempt: attemptDetail, results: attemptDetail?.results ?? [] }}
        onClose={closeDetail}
        onUpdateCorrectness={updateCorrectness}
        updatingQuestionId={updatingQuestionId}
        updateError={detailUpdateError}
      />
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div role="status" aria-label="Cargando resultados" className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-[132px] animate-pulse rounded-2xl border border-[#e4ebdf] bg-white/80" />
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

export default ResultsPage;
