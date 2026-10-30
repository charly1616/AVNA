import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import ActivityDetailsCard from "@/features/activities/components/ActivityDetailsCard";
import ActivityEditModal from "@/features/activities/components/ActivityEditModal";
import ActivityQuestionsSection from "@/features/activities/components/ActivityQuestionsSection";
import ManageIcon from "@/shared/components/icons/ManageIcon.jsx";
import TeacherHeader from "@/app/layouts/TeacherHeader.jsx";
import PageDecorations from "@/shared/components/layout/PageDecorations.jsx";
import { useActivity } from "../hooks/useActivities.js";
import { useUpdateActivity } from "../hooks/useActivityMutations.js";
import { useQuestionDraft } from "../hooks/useQuestionDraft.js";

export function EditActivityPage() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { data: activity, isLoading, error } = useActivity(activityId);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const updateActivity = useUpdateActivity();

  const {
    questions,
    questionSaveStatus,
    questionSaveError,
    localSaveError,
    updateQuestion,
    updateOption,
    addQuestion,
    updateSortItem,
    updatePair,
    addQuestionEntry,
    removeQuestionEntry,
    updateConceptCard,
    addConceptCard,
    removeQuestion,
  } = useQuestionDraft(activityId, activity?.questions);

  const saveActivityDetails = async (values) => {
    setIsSaving(true);
    setSaveError("");
    try {
      const updatedActivity = await updateActivity.mutateAsync({ id: activityId, values });
      setModalOpen(false);
    } catch (err) {
      setSaveError(err?.response?.data?.message || "No se pudieron guardar los datos de la actividad.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <main className="relative isolate h-[100svh] overflow-x-clip overflow-y-auto overscroll-y-contain bg-[#fbfbf6] text-[#124d3b] [background-image:radial-gradient(circle_at_0%_0%,#e1efdc_0,transparent_22%)]">
        <PageDecorations footer="waves" />
        <TeacherHeader sticky />

        <div className="mx-auto w-[calc(100%-40px)] max-w-[1440px] px-0 pb-[190px] pt-5 sm:w-[calc(100%-64px)] sm:pt-[30px] 2xl:w-[calc(100%-120px)]">
          <button type="button" onClick={() => navigate("/manage")} className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-bold text-[#17654d] transition hover:bg-[#eaf3e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b4b]">
            <ManageIcon name="back" className="h-4 w-4" />
            Volver a actividades
          </button>

          {isLoading ? (
            <section role="status" className="rounded-2xl border border-[#e4ebdf] bg-white/80 px-5 py-12 text-center text-sm font-semibold text-[#718078]">
              Cargando actividad...
            </section>
          ) : error && !activity ? (
            <section role="alert" className="rounded-2xl border border-[#e4ebdf] bg-white px-5 py-10 text-center">
              <p className="font-extrabold">{error.message || "No se pudo cargar esta actividad."}</p>
              <button type="button" onClick={() => navigate("/manage")} className="mt-4 rounded-full bg-[#006b4b] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#00583f]">
                Volver a actividades
              </button>
            </section>
          ) : activity && (
            <>
              <ActivityDetailsCard activity={activity} saveError={saveError} onEdit={() => setModalOpen(true)} />

              <ActivityQuestionsSection
                questions={questions}
                saveStatus={questionSaveStatus}
                saveError={questionSaveError}
                localSaveError={localSaveError}
                retrySave={() => {}}
                typePickerOpen={false}
                onToggleTypePicker={() => {}}
                onAddQuestion={addQuestion}
                onRemoveQuestion={removeQuestion}
                onUpdateQuestion={updateQuestion}
                onUpdateOption={updateOption}
                onUpdateSortItem={updateSortItem}
                onUpdatePair={updatePair}
                onAddEntry={addQuestionEntry}
                onRemoveEntry={removeQuestionEntry}
                onUpdateConceptCard={updateConceptCard}
                onAddConcept={(question) => addConceptCard(question)}
              />
            </>
          )}
        </div>
      </main>

      <ActivityEditModal open={modalOpen} activity={activity} onClose={() => setModalOpen(false)} onSave={saveActivityDetails} saving={isSaving} />
    </>
  );
}

export default EditActivityPage;
