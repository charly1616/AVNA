import React from "react";
import { Link } from "react-router";

export function RegisterForm({ onSubmit, isSubmitting, error }) {
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.({ name, password, confirmPassword });
  };

  return (
    <>
      <h2 className="text-[24px] font-semibold text-[#005638]">Crear cuenta</h2>
      <p className="mb-7 mt-1 text-sm text-[#426354]">Únete a la comunidad de aprendizaje</p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4 flex h-[58px] items-center gap-[14px] rounded-xl border border-[#dce8d7] bg-white/80 px-[18px] focus-within:border-[#006341] focus-within:ring-4 focus-within:ring-[#006341]/10">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#426354" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 21" />
          </svg>
          <input
            type="text"
            placeholder="Usuario"
            aria-label="Usuario"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-[#005638] placeholder:text-[#829488] outline-none"
          />
        </div>

        <div className="mb-4 flex h-[58px] items-center gap-[14px] rounded-xl border border-[#dce8d7] bg-white/80 px-[18px] focus-within:border-[#006341] focus-within:ring-4 focus-within:ring-[#006341]/10">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#426354" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7A4 4 0 0 1 16 7V10" />
            <circle cx="12" cy="15.5" r="1" fill="#14301f" stroke="none" />
          </svg>
          <input
            id="register-password"
            type="password"
            placeholder="Contraseña"
            aria-label="Contraseña"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-[#005638] placeholder:text-[#829488] outline-none"
          />
        </div>

        <div className="mb-4 flex h-[58px] items-center gap-[14px] rounded-xl border border-[#dce8d7] bg-white/80 px-[18px] focus-within:border-[#006341] focus-within:ring-4 focus-within:ring-[#006341]/10">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#426354" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7A4 4 0 0 1 16 7V10" />
            <circle cx="12" cy="15.5" r="1" fill="#14301f" stroke="none" />
          </svg>
          <input
            id="register-confirm"
            type="password"
            placeholder="Repite tu contraseña"
            aria-label="Confirmar contraseña"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-[#005638] placeholder:text-[#829488] outline-none"
          />
        </div>

        {error && <p className="mb-3 rounded-lg bg-[#dc3545]/10 px-2.5 py-2 text-xs text-[#c0392b]" role="alert">{error}</p>}

        <button className="relative flex h-14 w-full items-center justify-center rounded-xl bg-[#006341] text-base font-semibold text-white transition hover:bg-[#005638] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#9bc53d]" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          <svg className="absolute right-[22px]" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12H20" />
            <path d="M14 6L20 12L14 18" />
          </svg>
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[#426354]">
        ¿Ya tienes una cuenta?<Link to="/login" className="ml-1.5 font-semibold text-[#006341] hover:text-[#78aa4c]">Inicia sesión</Link>
      </p>
    </>
  );
}

export default RegisterForm;