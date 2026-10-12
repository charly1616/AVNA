import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore.js";
import UniversityLogo from "../UniversityLogo.jsx";

export function TeacherHeader({ sticky = false }) {
  const { teacher, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={`${sticky ? "sticky top-0 border-b border-[#dce8d7]/20 bg-[#e1efdc]/20 shadow-[0_6px_20px_rgba(0,76,51,0.04)] backdrop-blur-xl" : "relative"} z-20 flex min-h-[76px] items-center justify-between gap-4 px-[5%] py-3 sm:min-h-[88px] sm:py-4`}>
      <UniversityLogo />

      <div className="relative flex items-center gap-4">
        <div className="hidden items-center gap-2 text-sm sm:flex">
          <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#e5f0df] text-[#006341]" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20c.7-3.2 3.1-5 7-5s6.3 1.8 7 5" />
            </svg>
          </span>
          <span className="max-w-[160px] truncate">{teacher?.name || "Usuario"}</span>
        </div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full text-[26px] text-[#006341] transition hover:bg-[#e5f0df] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#9bc53d]"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-12 z-30 min-w-48 rounded-xl border border-[#dce8d7] bg-white p-3 shadow-lg">
            <p className="truncate px-2 py-2 text-sm font-semibold text-[#005638]">{teacher?.name || "Usuario"}</p>
            <button
              type="button"
              onClick={() => void logout()}
              className="w-full rounded-lg px-2 py-2 text-left text-sm text-[#005638] hover:bg-[#edf5e9] focus-visible:outline-2 focus-visible:outline-[#9bc53d]"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default TeacherHeader;