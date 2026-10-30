import ResultsIcon from "@/shared/components/icons/ResultsIcon.jsx";

const tones = {
  green: {
    card: "border-[#dcebd7] bg-white",
    icon: "bg-[#e6f3e1] text-[#006b4b]",
    value: "text-[#00583f]",
  },
  lime: {
    card: "border-[#e3edc8] bg-[#fbfef2]",
    icon: "bg-[#edf7d3] text-[#567800]",
    value: "text-[#466400]",
  },
  yellow: {
    card: "border-[#f3e6b8] bg-[#fffdf4]",
    icon: "bg-[#fff4c9] text-[#8a6a00]",
    value: "text-[#7a5e00]",
  },
  rose: {
    card: "border-[#f0dcd9] bg-[#fffafa]",
    icon: "bg-[#ffebe7] text-[#b83a34]",
    value: "text-[#9d312c]",
  },
};

export function StatCard({ label, value, hint, icon = "chart", tone = "green" }) {
  const palette = tones[tone] ?? tones.green;

  return (
    <article
      className={`rounded-2xl border p-4 shadow-[0_5px_18px_rgba(0,76,51,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,76,51,0.08)] sm:p-5 ${palette.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[.72rem] font-extrabold uppercase tracking-[0.12em] text-[#718078]">
          {label}
        </p>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${palette.icon}`}>
          <ResultsIcon name={icon} className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className={`mt-3 text-[1.65rem] font-black leading-none sm:text-[1.85rem] ${palette.value}`}>
        {value}
      </p>
      {hint && <p className="mt-2 text-xs font-semibold text-[#718078]">{hint}</p>}
    </article>
  );
}

export default StatCard;
