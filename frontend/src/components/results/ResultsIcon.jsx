const iconShapes = {
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c.5-3.1 2.7-4.8 5.5-4.8s5 1.7 5.5 4.8" /><path d="M16 5.2a3 3 0 0 1 0 5.6M17 15.4c2.1.4 3.4 1.8 3.8 4.1" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.7 2.7L16.5 9" /></>,
  average: <><path d="M4 20V10m5 10V4m5 16v-7m5 7V7" /><path d="M2 20h20" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.2" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" /></>,
  trophy: <><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" /><path d="M8 5H5v2a3 3 0 0 0 3 3m8-5h3v2a3 3 0 0 1-3 3M12 12v5m-3 3h6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  refresh: <><path d="M20 11a8 8 0 1 0-1.7 5.7" /><path d="M20 5v6h-6" /></>,
  close: <path d="m18 6-12 12M6 6l12 12" />,
  arrow: <path d="m9 6 6 6-6 6" />,
  chart: <><path d="M4 19h16" /><path d="m6 15 4-5 3 3 5-7" /></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
};

export function ResultsIcon({ name, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconShapes[name] || iconShapes.chart}
    </svg>
  );
}

export default ResultsIcon;
