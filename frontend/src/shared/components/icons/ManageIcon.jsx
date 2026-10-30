const iconShapes = {
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M4 5.5v16M8 7h8M8 11h8M8 15h5" /></>,
  spell: <><path d="M4 18 9 6l5 12M6 14h6" /><path d="m15 15 2.5 2.5L22 12" /></>,
  calculator: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 11h2m4 0h2m-8 4h2m4 0h2m-8 3h2m4 0h2" /></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.4-3.4 1.9 1.9 0 0 1 1.4-3.2H18a3 3 0 0 0 3-3A8.4 8.4 0 0 0 12 3Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7.5" r="1" /><circle cx="15" cy="7.5" r="1" /></>,
  bulb: <><path d="M9 18h6m-5 3h4m-2-18a7 7 0 0 0-4 12.7c.6.4 1 1 1 1.8h6c0-.8.4-1.4 1-1.8A7 7 0 0 0 12 3Z" /></>,
  flask: <><path d="M9 3h6m-5 0v6L5 19a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-10V3" /><path d="M8 16h8" /></>,
  puzzle: <><path d="M4 4h5a3 3 0 1 1 6 0h5v5a3 3 0 1 0 0 6v5h-5a3 3 0 1 0-6 0H4v-5a3 3 0 1 1 0-6V4Z" /></>,
  brain: <><path d="M12 5a3 3 0 0 0-5.8-1 3.5 3.5 0 0 0-2 5.8A3.5 3.5 0 0 0 6 16.2 3 3 0 0 0 12 18V5Zm0 0a3 3 0 0 1 5.8-1 3.5 3.5 0 0 1 2 5.8 3.5 3.5 0 0 1-1.8 6.4A3 3 0 0 1 12 18V5Z" /><path d="M8 8h1m6 0h1m-8 5h1m6 0h1" /></>,
  plus: <path d="M12 5v14m-7-7h14" />,
  close: <path d="m18 6-12 12M6 6l12 12" />,
  back: <path d="m15 18-6-6 6-6M9 12h12" />,
  edit: <><path d="m15 5 4 4M4 20l4.2-.9L19 8.3a2.1 2.1 0 0 0-3-3L5.2 16.1 4 20Z" /><path d="M13 20h7" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7" /></>,
  pause: <><path d="M8 5v14m8-14v14" /></>,
  play: <path d="m7 4 13 8-13 8V4Z" />,
  trash: <><path d="M4 7h16m-10 4v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" /></>,
  folder: <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />,
  check: <path d="m5 12 4 4L19 6" />,
};

export function ManageIcon({ name, className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconShapes[name] || iconShapes.book}
    </svg>
  );
}

export default ManageIcon;
