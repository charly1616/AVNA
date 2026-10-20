import ManageIcon from "./ManageIcon.jsx";

const answerLabel = (index) => {
  let value = index + 1;
  let label = "";
  while (value > 0) {
    value -= 1;
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }
  return label;
};

export function ActivityQuestionCard({
  question,
  questionIndex,
  typeLabel,
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
    <article className="rounded-xl border border-[#e4ebdf] bg-white p-4 shadow-[0_5px_18px_rgba(0,76,51,0.035)] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-[#17654d]">Pregunta {String(questionIndex + 1).padStart(2, "0")}</h3>
          <p className="mt-0.5 text-xs text-[#718078]">{typeLabel}</p>
        </div>
        <button type="button" onClick={onRemoveQuestion} title="Eliminar pregunta" aria-label={`Eliminar pregunta ${questionIndex + 1}`} className="grid h-9 w-9 place-items-center rounded-lg text-[#b83a34] transition hover:bg-[#fff0ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b83a34]">
          <ManageIcon name="trash" />
        </button>
      </div>

      <label htmlFor={`question-${question.id}`} className="mb-2 block text-sm font-bold text-[#124d3b]">Título de la pregunta</label>
      <input id={`question-${question.id}`} value={question.title} onChange={(event) => onUpdateQuestion(question.id, { title: event.target.value })} maxLength={120} placeholder="Escribe un título..." className="mb-4 min-h-12 w-full rounded-lg border border-[#dbe5d7] bg-white px-3 text-sm text-[#124d3b] outline-none transition placeholder:text-[#99a49d] focus:border-[#006b4b] focus:ring-4 focus:ring-[#006b4b]/10" />

      {question.type === "abc" && (
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-[#124d3b]">Opciones <span className="font-normal text-[#718078]">(marca la respuesta correcta)</span></legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className={`flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2 transition ${question.correctOption === optionIndex ? "border-[#87bd92] bg-[#f0f8ef]" : "border-[#e4ebdf] bg-[#fbfcf9]"}`}>
                <input type="radio" name={`correct-${question.id}`} checked={question.correctOption === optionIndex} onChange={() => onUpdateQuestion(question.id, { correctOption: optionIndex })} aria-label={`Marcar opción ${answerLabel(optionIndex)} como correcta`} className="h-4 w-4 shrink-0 accent-[#087b55]" />
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white text-xs font-black text-[#17654d]">{answerLabel(optionIndex)}</span>
                <input value={option} onChange={(event) => onUpdateOption(question, optionIndex, event.target.value)} maxLength={200} aria-label={`Texto de la opción ${answerLabel(optionIndex)}`} placeholder={`Opción ${answerLabel(optionIndex)}`} className="min-w-0 flex-1 bg-transparent text-sm text-[#124d3b] outline-none placeholder:text-[#99a49d]" />
                <button type="button" onClick={() => onRemoveEntry(question, "options", optionIndex)} disabled={question.options.length <= 2} title={`Eliminar opción ${answerLabel(optionIndex)}`} aria-label={`Eliminar opción ${answerLabel(optionIndex)}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#b83a34] transition hover:bg-[#fff0ef] disabled:cursor-not-allowed disabled:opacity-30">
                  <ManageIcon name="close" className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => onAddEntry(question, "options", "")} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-xs font-extrabold text-[#006b4b] hover:bg-[#edf6e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b4b]">
            <ManageIcon name="plus" className="h-4 w-4" />
            Agregar opción
          </button>
        </fieldset>
      )}

      {question.type === "sort" && (
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-[#124d3b]">Elementos en el orden correcto</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {question.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex min-w-0 items-center gap-2 rounded-lg border border-[#e4ebdf] bg-[#fbfcf9] px-3 py-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white text-xs font-black text-[#17654d]">{itemIndex + 1}</span>
                <input value={item} onChange={(event) => onUpdateSortItem(question, itemIndex, event.target.value)} maxLength={200} aria-label={`Elemento en posición ${itemIndex + 1}`} placeholder={`Elemento ${itemIndex + 1}`} className="min-w-0 flex-1 bg-transparent text-sm text-[#124d3b] outline-none placeholder:text-[#99a49d]" />
                <button type="button" onClick={() => onRemoveEntry(question, "items", itemIndex)} disabled={question.items.length <= 2} title={`Eliminar elemento ${itemIndex + 1}`} aria-label={`Eliminar elemento ${itemIndex + 1}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#b83a34] transition hover:bg-[#fff0ef] disabled:cursor-not-allowed disabled:opacity-30">
                  <ManageIcon name="close" className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => onAddEntry(question, "items", "")} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-xs font-extrabold text-[#006b4b] hover:bg-[#edf6e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b4b]">
            <ManageIcon name="plus" className="h-4 w-4" />
            Agregar elemento
          </button>
        </fieldset>
      )}

      {question.type === "lines" && (
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-[#124d3b]">Pares que se deben unir</legend>
          <div className="mb-1 hidden grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_2rem] items-center gap-2 px-2 text-xs font-bold text-[#718078] sm:grid">
            <span>Elemento izquierdo</span><span aria-hidden="true" /><span>Elemento relacionado</span><span aria-hidden="true" />
          </div>
          <div className="grid gap-2">
            {question.pairs.map((pair, pairIndex) => (
              <div key={pairIndex} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_2rem] items-center gap-1.5 rounded-lg border border-[#e4ebdf] bg-[#fbfcf9] p-1.5 sm:gap-2 sm:px-2">
                <input value={pair.left} onChange={(event) => onUpdatePair(question, pairIndex, "left", event.target.value)} maxLength={200} aria-label={`Elemento izquierdo del par ${pairIndex + 1}`} placeholder={`Elemento ${pairIndex + 1}`} className="min-h-9 min-w-0 rounded-md bg-white px-2 py-1.5 text-xs text-[#124d3b] outline-none placeholder:text-[#99a49d] focus:ring-2 focus:ring-[#006b4b]/20 sm:px-2.5 sm:text-sm" />
                <span aria-hidden="true" className="text-xs text-[#87bd92] sm:text-sm">↔</span>
                <input value={pair.right} onChange={(event) => onUpdatePair(question, pairIndex, "right", event.target.value)} maxLength={200} aria-label={`Elemento relacionado del par ${pairIndex + 1}`} placeholder="Se une con..." className="min-h-9 min-w-0 rounded-md bg-white px-2 py-1.5 text-xs text-[#124d3b] outline-none placeholder:text-[#99a49d] focus:ring-2 focus:ring-[#006b4b]/20 sm:px-2.5 sm:text-sm" />
                <button type="button" onClick={() => onRemoveEntry(question, "pairs", pairIndex)} disabled={question.pairs.length <= 2} title={`Eliminar par ${pairIndex + 1}`} aria-label={`Eliminar par ${pairIndex + 1}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#b83a34] transition hover:bg-[#fff0ef] disabled:cursor-not-allowed disabled:opacity-30">
                  <ManageIcon name="close" className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => onAddEntry(question, "pairs", { left: "", right: "" })} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-xs font-extrabold text-[#006b4b] hover:bg-[#edf6e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b4b]">
            <ManageIcon name="plus" className="h-4 w-4" />
            Agregar par
          </button>
        </fieldset>
      )}

      {question.type === "concepts" && (
        <fieldset>
          <legend className="mb-2 flex w-full items-center justify-between gap-3 text-sm font-bold text-[#124d3b] sm:mb-2.5">
            <span>Tarjetas de conceptos</span>
            <span className="text-xs font-semibold text-[#8b6811]">{question.concepts.length} / 4</span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-2.5 lg:grid-cols-4">
            {question.concepts.map((concept, conceptIndex) => (
              <article key={concept.id} className="min-w-0 rounded-lg border border-[#e6d39b] bg-[#fffdf7] p-2.5 sm:p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="text-xs font-black uppercase text-[#85630b]">Tarjeta {conceptIndex + 1}</h4>
                  <button type="button" onClick={() => onRemoveEntry(question, "concepts", conceptIndex)} disabled={question.concepts.length <= 2} title={`Eliminar tarjeta ${conceptIndex + 1}`} aria-label={`Eliminar tarjeta de concepto ${conceptIndex + 1}`} className="grid h-7 w-7 place-items-center rounded-md text-[#9a6516] transition hover:bg-[#fff0d0] disabled:cursor-not-allowed disabled:opacity-30">
                    <ManageIcon name="close" className="h-4 w-4" />
                  </button>
                </div>
                <label htmlFor={`concept-title-${concept.id}`} className="mb-1 block text-[11px] font-bold text-[#124d3b]">Concepto</label>
                <input id={`concept-title-${concept.id}`} value={concept.title} onChange={(event) => onUpdateConceptCard(question, concept.id, { title: event.target.value })} maxLength={120} placeholder="Nombre del concepto" className="mb-2 min-h-9 w-full rounded-md border border-[#e4ebdf] bg-white px-2.5 text-sm text-[#124d3b] outline-none placeholder:text-[#99a49d] focus:border-[#b78a1a] focus:ring-2 focus:ring-[#d4aa43]/25" />
                <label htmlFor={`concept-question-${concept.id}`} className="mb-1 block text-[11px] font-bold text-[#124d3b]">Pregunta sorpresa</label>
                <textarea id={`concept-question-${concept.id}`} value={concept.question} onChange={(event) => onUpdateConceptCard(question, concept.id, { question: event.target.value })} maxLength={500} rows={2} placeholder="¿Qué pregunta aparecerá al elegir esta tarjeta?" className="mb-2 min-h-9 w-full resize-y rounded-md border border-[#e4ebdf] bg-white px-2.5 py-1.5 text-sm text-[#124d3b] outline-none placeholder:text-[#99a49d] focus:border-[#b78a1a] focus:ring-2 focus:ring-[#d4aa43]/25" />
                <label htmlFor={`concept-answer-${concept.id}`} className="mb-1 block text-[11px] font-bold text-[#124d3b]">Respuesta esperada</label>
                <textarea id={`concept-answer-${concept.id}`} value={concept.expectedAnswer} onChange={(event) => onUpdateConceptCard(question, concept.id, { expectedAnswer: event.target.value })} maxLength={500} rows={2} placeholder="Describe qué debería responder el estudiante" className="min-h-9 w-full resize-y rounded-md border border-[#e4ebdf] bg-white px-2.5 py-1.5 text-sm text-[#124d3b] outline-none placeholder:text-[#99a49d] focus:border-[#b78a1a] focus:ring-2 focus:ring-[#d4aa43]/25" />
              </article>
            ))}
          </div>
          <button type="button" onClick={() => onAddConcept(question)} disabled={question.concepts.length >= 4} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-xs font-extrabold text-[#85630b] transition hover:bg-[#fff5d6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b78a1a] disabled:cursor-not-allowed disabled:opacity-40">
            <ManageIcon name="plus" className="h-4 w-4" />
            Agregar tarjeta
          </button>
        </fieldset>
      )}
    </article>
  );
}

export default ActivityQuestionCard;
