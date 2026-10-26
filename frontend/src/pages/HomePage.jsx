import { Link } from "react-router";
import { useAuthStore } from "../store/useAuthStore.js";
import AVNATitle from "../components/AVNATitle.jsx";
import TeacherHeader from "../components/layout/TeacherHeader.jsx";
import PageDecorations from "../components/layout/PageDecorations.jsx";

const actions = [
  {
    label: <>Diseñar<br />actividad</>,
    tone: "green",
    image: "/Librito.png",
    to: "/manage",
  },
  {
    label: <>Ver<br />resultados</>,
    tone: "yellow",
    image: "/Resultadito.png",
    to: "/results",
  },
  {
    label: <>Generar<br />con IA</>,
    tone: "lime",
    image: "/Ai_generar.png",
  },
];

const actionTones = {
  green: "bg-gradient-to-r from-[#006341] to-[#08734a] text-white",
  yellow: "bg-gradient-to-r from-[#ffd43b] to-[#ffce2c] text-[#405b0c]",
  lime: "bg-gradient-to-r from-[#b8dcb2] to-[#9bc53d] text-[#005638]",
};

const arrowTones = {
  green: "bg-[#18a95d]/55 text-white",
  yellow: "bg-[#7b8b00]/45 text-white",
  lime: "bg-[#005638]/35 text-[#005638]",
};

export function HomePage() {
  const { teacher } = useAuthStore();

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#fbfbf6] text-[#005638] [background-image:radial-gradient(circle_at_0%_0%,#e1efdc_0,transparent_22%)] lg:h-screen lg:min-h-[680px]">
      <PageDecorations />
      <TeacherHeader />

      <section className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 items-start gap-6 px-5 pb-8 pt-10 sm:px-[5%] md:gap-8 lg:min-h-0 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-[clamp(30px,5vw,80px)] lg:pt-5">
        <div className="hidden self-start pt-5 text-center lg:block lg:pt-[clamp(8px,6vh,80px)]">
          <AVNATitle />
          <div className="mt-[clamp(10px,2vh,26px)]">
            <h2 className="mb-1 text-[clamp(19px,1.8vw,26px)]">¡Hola{teacher?.name ? `, ${teacher.name}` : ""}!</h2>
            <p className="text-[clamp(15px,1.5vw,21px)]">Bienvenido a AVNA</p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[680px] lg:max-w-none">
          <div className="mb-5 text-center lg:hidden">
            <h1 className="mt-1 text-3xl font-black text-[#005638]">¡Hola{teacher?.name ? `, ${teacher.name}` : ""}!</h1>
            <p className="mt-1 text-sm text-[#426354]">Bienvenido a AVNA</p>
          </div>

          <nav className="flex flex-col gap-3 sm:gap-4 lg:gap-[clamp(10px,2vh,26px)]" aria-label="Acciones principales">
            {actions.map((action, index) => {
              const Action = action.to ? Link : "button";
              return (
                <Action
                  key={index}
                  {...(action.to ? { to: action.to } : { type: "button" })}
                  className={`group grid min-h-[88px] w-full grid-cols-[64px_minmax(0,1fr)_42px] items-center gap-3 rounded-[28px] px-4 py-3 text-left transition duration-200 hover:-translate-y-1 hover:brightness-105 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#9bc53d] sm:min-h-[105px] sm:grid-cols-[85px_minmax(0,1fr)_48px] sm:gap-4 sm:px-6 sm:py-4 lg:min-h-[clamp(84px,14vh,155px)] lg:grid-cols-[minmax(80px,125px)_1fr_64px] lg:gap-[clamp(12px,2vw,28px)] lg:rounded-full lg:px-[clamp(20px,3vw,42px)] lg:py-[clamp(8px,1.6vh,16px)] ${actionTones[action.tone]}`}
                >
                  <span className="grid place-items-center">
                    <img src={action.image} alt="" className="block h-auto w-[56px] max-h-[65px] object-contain sm:w-[78px] sm:max-h-[78px] lg:w-full lg:max-w-[125px] lg:max-h-[clamp(52px,8.5vh,110px)]" />
                  </span>
                  <span className="text-[clamp(19px,5vw,26px)] font-extrabold leading-[1.12] sm:text-[26px] lg:text-[clamp(21px,2.1vw,32px)]">{action.label}</span>
                  <span className={`grid h-10 w-10 place-items-center justify-self-end rounded-full text-2xl transition-transform group-hover:translate-x-1 sm:h-12 sm:w-12 sm:text-3xl lg:h-[clamp(48px,5vw,66px)] lg:w-[clamp(48px,5vw,66px)] lg:text-[43px] ${arrowTones[action.tone]}`} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
                  </span>
                </Action>
              );
            })}
          </nav>
        </div>
      </section>

    </main>
  );
}

export default HomePage;