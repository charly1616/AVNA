import ActivityQuestionCard from "./ActivityQuestionCard.jsx";
import ManageIcon from "@/shared/components/icons/ManageIcon.jsx";

const questionTypeLabels = {
  abc: "Selección ABCD",
  sort: "Ordenar elementos",
  lines: "Unir con líneas",
  concepts: "Tarjetas sorpresa",
};

export function ActivityQuestionsSection({
  questions,
  saveStatus,
  saveError,
  localSaveError,
  retrySave,
  typePickerOpen,
  onToggleTypePicker,
  onAddQuestion,
  onRemoveQuestion,
  onUpdateQuestion,
  onUpdateOption,
  onUpdateSortItem,
  onUpdatePair,
  onAddEntry,
  onRemoveEntry,
  onUpdateConceptCard,
  onAddConcept,
}) {
  return (
    <section aria-labelledby="questions-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="questions-title" className="text-xl font-black text-[#00583f] sm:text-2xl">Preguntas de la actividad</h2>
          <p className="mt-1 text-sm text-[#718078]">Elige un formato para cada pregunta.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span role="status" className={`text-xs font-semibold ${localSaveError || saveStatus === "error" ? "text-[#b83a34]" : saveStatus === "incomplete" ? "text-[#8b6811]" : "text-[#117a3d]"}`}>
            {localSaveError
              ? "Copia local no disponible"
              : saveStatus === "saving"
                ? "Guardando en la actividad..."
                : saveStatus === "pending"
                  ? "Cambios pendientes..."
                  : saveStatus === "incomplete"
                    ? saveError
                    : saveStatus === "error"
                      ? saveError
                      : "Guardado en la actividad"}
          </span>
          {saveStatus === "error" && (
            <button type="button" onClick={retrySave} className="text-xs font-extrabold text-[#006b4b] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b4b]">
              Reintentar
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {questions.map((question, questionIndex) => (
          <ActivityQuestionCard
            key={question.id}
            question={question}
            questionIndex={questionIndex}
            typeLabel={questionTypeLabels[question.type]}
            onRemoveQuestion={() => onRemoveQuestion(question.id)}
            onUpdateQuestion={onUpdateQuestion}
            onUpdateOption={onUpdateOption}
            onUpdateSortItem={onUpdateSortItem}
            onUpdatePair={onUpdatePair}
            onAddEntry={onAddEntry}
            onRemoveEntry={onRemoveEntry}
            onUpdateConceptCard={onUpdateConceptCard}
            onAddConcept={onAddConcept}
          />
        ))}
      </div>

      {typePickerOpen && (
        <div role="group" aria-label="Tipo de pregunta" className="mt-4 rounded-xl border border-[#dce8d7] bg-white p-4 shadow-[0_8px_24px_rgba(0,76,51,0.05)]">
          <p className="mb-3 text-sm font-extrabold text-[#124d3b]">¿Qué tipo de pregunta quieres crear?</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {Object.entries(questionTypeLabels).map(([type, label]) => (
              <button key={type} type="button" onClick={() => onAddQuestion(type)} className={`min-h-11 rounded-lg px-3 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b4b] ${type === "concepts" ? "border-2 border-[#c89a21] bg-[#fff5d6] text-[#76580c] shadow-[0_2px_10px_rgba(194,151,37,0.12)] hover:bg-[#ffefc2]" : "border border-[#e4ebdf] bg-[#f7faf4] text-[#17654d] hover:border-[#87bd92] hover:bg-[#edf6e9]"}`}>
                {type === "concepts" && <span aria-hidden="true" className="mr-1 text-[#b18410]">★</span>}
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button type="button" onClick={onToggleTypePicker} aria-expanded={typePickerOpen} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-[#87bd92] bg-white/80 px-4 text-sm font-extrabold text-[#006b4b] transition hover:bg-[#edf6e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b4b]">
        <ManageIcon name="plus" />
        {typePickerOpen ? "Cancelar" : "Añadir pregunta"}
      </button>
    </section>
  );
}

export default ActivityQuestionsSection;
