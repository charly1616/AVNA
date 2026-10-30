import { useState } from "react";
import { Link } from "react-router";
import { useAuthStore } from "@/features/auth/index.js";
import AVNATitle from "@/shared/components/brand/AVNATitle.jsx";
import TeacherHeader from "@/app/layouts/TeacherHeader.jsx";
import PageDecorations from "@/shared/components/layout/PageDecorations.jsx";
import ShareExamModal from "@/features/activities/components/ShareExamModal.jsx";
import HomeActionCard from "@/features/home/components/HomeActionCard";

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
    label: <>Compartir<br />examen</>,
    tone: "lime",
    icon: <ShareGlyph />,
    action: "share",
  },
];

function ShareGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-12 w-12 sm:h-14 sm:w-14 lg:h-20 lg:w-20"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="5" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.7 10.6 6.6-3.9M8.7 13.4l6.6 3.9" />
    </svg>
  );
}

export function HomePage() {
  const { teacher } = useAuthStore();
  const [shareOpen, setShareOpen] = useState(false);

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
            {actions.map((action, index) => (
              <HomeActionCard key={String(action.label) + index} action={action} onShare={() => setShareOpen(true)} />
            ))}
          </nav>
        </div>
      </section>

      <ShareExamModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </main>
  );
}

export default HomePage;
