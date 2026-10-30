import { useMemo, useState } from "react";

import ResultsIcon from "@/shared/components/icons/ResultsIcon.jsx";
import { formatDate, formatDuration, scoreTone } from "../../../shared/lib/format.js";

const pillTones = {
  good: "bg-[#e6f7ed] text-[#0e7a3c]",
  warn: "bg-[#fff7d6] text-[#8a6a00]",
  bad: "bg-[#ffefec] text-[#a9352f]",
};

function ScorePill({ percent }) {
  const tone = pillTones[scoreTone(percent)] ?? pillTones.bad;

  return (
    <span className={`inline-flex min-w-[52px] justify-center rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>
      {percent}%
    </span>
  );
}

export function AttemptsTable({ attempts, onSelect }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("recent");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    const result = attempts.filter((attempt) => {
      if (status !== "all" && attempt.status !== status) return false;
      if (!term) return true;

      return (
        attempt.studentName.toLowerCase().includes(term) ||
        attempt.studentEmail.toLowerCase().includes(term)
      );
    });

    return [...result].sort((left, right) => {
      if (sort === "score") return right.percent - left.percent;
      if (sort === "name") return left.studentName.localeCompare(right.studentName);
      return new Date(right.createdAt) - new Date(left.createdAt);
    });
  }, [attempts, query, status, sort]);

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e4ebdf] bg-white shadow-[0_5px_18px_rgba(0,76,51,0.04)]">
      <div className="flex flex-col gap-4 border-b border-[#eef2ea] p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-extrabold text-[#00583f]">
            <ResultsIcon name="users" className="h-[18px] w-[18px] text-[#006b4b]" />
            Resultados de estudiantes
          </h2>
          <p className="mt-1 text-sm text-[#718078]">
            {filtered.length} de {attempts.length} intentos
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(0,220px)_140px_140px]">
          <label className="relative block">
            <span className="sr-only">Buscar estudiante</span>
            <ResultsIcon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8aa095]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar estudiante"
              className="h-10 w-full rounded-xl border border-[#dce8d7] bg-[#f9fcf7] pl-9 pr-3 text-sm font-semibold text-[#14301f] outline-none transition placeholder:text-[#9aa79f] focus:border-[#91c83e] focus:ring-2 focus:ring-[#91c83e]/30"
            />
          </label>

          <label>
            <span className="sr-only">Filtrar por estado</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#dce8d7] bg-[#f9fcf7] px-3 text-sm font-bold text-[#3f5a4c] outline-none transition focus:border-[#91c83e] focus:ring-2 focus:ring-[#91c83e]/30"
            >
              <option value="all">Todos</option>
              <option value="submitted">Entregados</option>
              <option value="in_progress">En curso</option>
            </select>
          </label>

          <label>
            <span className="sr-only">Ordenar por</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#dce8d7] bg-[#f9fcf7] px-3 text-sm font-bold text-[#3f5a4c] outline-none transition focus:border-[#91c83e] focus:ring-2 focus:ring-[#91c83e]/30"
            >
              <option value="recent">Recientes</option>
              <option value="score">Puntaje</option>
              <option value="name">Nombre</option>
            </select>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <ResultsIcon name="users" className="mx-auto h-8 w-8 text-[#b9cfb1]" />
          <p className="mt-3 text-sm font-extrabold text-[#54705f]">
            No hay resultados con esos filtros.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="bg-[#f7faf4] text-[.68rem] font-extrabold uppercase tracking-[0.12em] text-[#718078]">
                <th scope="col" className="px-5 py-3 sm:px-6">Estudiante</th>
                <th scope="col" className="px-3 py-3">Puntaje</th>
                <th scope="col" className="px-3 py-3">Correctas</th>
                <th scope="col" className="px-3 py-3">Tiempo</th>
                <th scope="col" className="px-3 py-3">Entrega</th>
                <th scope="col" className="px-3 py-3">Estado</th>
                <th scope="col" className="px-5 py-3 text-right sm:px-6">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2ea]">
              {filtered.map((attempt) => (
                <tr key={attempt.id} className="group transition hover:bg-[#f9fcf7]">
                  <td className="px-5 py-3.5 sm:px-6">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e6f3e1] text-xs font-black uppercase text-[#006b4b]">
                        {attempt.studentName.slice(0, 2)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-[#14301f]">{attempt.studentName}</p>
                        <p className="truncate text-xs text-[#718078]">{attempt.studentEmail || "Sin correo"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5"><ScorePill percent={attempt.percent} /></td>
                  <td className="px-3 py-3.5 text-sm font-bold text-[#3f5a4c]">
                    {attempt.score}/{attempt.total}
                  </td>
                  <td className="px-3 py-3.5 text-sm font-semibold text-[#54705f]">
                    {formatDuration(attempt.durationMs)}
                  </td>
                  <td className="px-3 py-3.5 text-xs font-semibold text-[#54705f]">
                    {formatDate(attempt.submittedAt || attempt.createdAt)}
                  </td>
                  <td className="px-3 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[.7rem] font-extrabold ${attempt.status === "submitted" ? "bg-[#e6f7ed] text-[#0e7a3c]" : "bg-[#fff7d6] text-[#8a6a00]"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${attempt.status === "submitted" ? "bg-[#1fae5a]" : "bg-[#e0b21a]"}`} />
                      {attempt.status === "submitted" ? "Entregado" : "En curso"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right sm:px-6">
                    <button
                      type="button"
                      onClick={() => onSelect(attempt.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#dce8d7] px-3 py-1.5 text-xs font-extrabold text-[#006b4b] transition hover:border-[#9bc53d] hover:bg-[#edf6e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#91c83e]"
                    >
                      Ver
                      <ResultsIcon name="arrow" className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AttemptsTable;
