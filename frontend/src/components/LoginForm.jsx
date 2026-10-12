import React from "react";
import { Link } from "react-router";

export function LoginForm({ onSubmit, isSubmitting, error }) {
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.({ name, password, remember });
  };

  return (
    <>
      <h2 className="text-[24px] font-semibold text-[#005638]">Iniciar sesión</h2>
      <p className="mb-7 mt-1 text-sm text-[#426354]">Accede a tu espacio de aprendizaje</p>
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
            autoComplete="username"
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
            id="pw"
            type="password"
            placeholder="Contraseña"
            aria-label="Contraseña"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-[#005638] placeholder:text-[#829488] outline-none"
          />
          <button
            type="button"
            className="flex border-0 bg-transparent p-0"
            aria-label="Mostrar contraseña"
            onClick={() => {
              const input = document.getElementById("pw");
              if (input) {
                input.type = input.type === "password" ? "text" : "password";
              }
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#426354" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M2 12S6 5 12 5S22 12 22 12S18 19 12 19S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>

        <div className="mb-6 mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[13px]">
          <label htmlFor="remember-user" className="flex cursor-pointer items-center gap-[10px] font-semibold">
            <input
              id="remember-user"
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-5 w-5 accent-[#006341]"
            />
            Recordar usuario
          </label>
          <a href="#" className="text-[12px] font-medium text-[#006341]">¿Olvidaste tu contraseña?</a>
        </div>

        {error && <p className="mb-3 rounded-lg bg-[#dc3545]/10 px-2.5 py-2 text-xs text-[#c0392b]" role="alert">{error}</p>}

        <button className="relative flex h-14 w-full items-center justify-center rounded-xl bg-[#006341] text-base font-semibold text-white transition hover:bg-[#005638] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#9bc53d]" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Ingresando..." : "Ingresar"}
          <svg className="absolute right-[22px]" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12H20" />
            <path d="M14 6L20 12L14 18" />
          </svg>
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[#14301f]">
        <span className="text-[#426354]">¿No tienes una cuenta?</span>
        <Link to="/register" className="ml-1.5 font-semibold text-[#006341] hover:text-[#78aa4c]">
          Regístrate
        </Link>
      </p>
    </>
  );
}

export default LoginForm;