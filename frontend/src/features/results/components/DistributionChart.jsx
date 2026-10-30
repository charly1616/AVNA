import ResultsIcon from "@/shared/components/icons/ResultsIcon.jsx";

export function DistributionChart({ distribution, total }) {
  const max = Math.max(1, ...distribution.map((bucket) => bucket.count));

  return (
    <section className="rounded-2xl border border-[#e4ebdf] bg-white p-5 shadow-[0_5px_18px_rgba(0,76,51,0.04)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-extrabold text-[#00583f]">
            <ResultsIcon name="chart" className="h-[18px] w-[18px] text-[#006b4b]" />
            Distribución de puntajes
          </h2>
          <p className="mt-1 text-sm text-[#718078]">
            Cómo se reparten los intentos entregados por rango.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#e6f3e1] px-3 py-1 text-xs font-extrabold text-[#006b4b]">
          {total} entregados
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {distribution.map((bucket) => {
          const width = (bucket.count / max) * 100;
          const share = total > 0 ? Math.round((bucket.count / total) * 100) : 0;

          return (
            <div key={bucket.label} className="grid grid-cols-[62px_minmax(0,1fr)_46px] items-center gap-3">
              <span className="text-xs font-bold text-[#718078]">{bucket.label}</span>
              <div className="h-3 overflow-hidden rounded-full bg-[#eef3ea]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#c7df68] via-[#7fbf5a] to-[#006b4b] transition-[width] duration-500"
                  style={{ width: `${Math.max(width, bucket.count > 0 ? 4 : 0)}%` }}
                />
              </div>
              <span className="text-right text-xs font-extrabold text-[#00583f]">
                {bucket.count}
                <span className="ml-1 font-semibold text-[#9aa79f]">{share}%</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default DistributionChart;
