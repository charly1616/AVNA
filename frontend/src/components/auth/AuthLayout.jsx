import DnaBackground from "./DnaBackground.jsx";
import UniversityLogo from "../UniversityLogo.jsx";
import AVNATitle from "../AVNATitle.jsx";

export function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fbfbf6] text-[#005638]">
      <DnaBackground />

      <UniversityLogo placement="auth" />

      <main className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1180px] flex-col items-center justify-center gap-5 px-4 pb-8 pt-[104px] sm:gap-8 sm:px-8 sm:pb-12 sm:pt-[128px] lg:flex-row lg:gap-[clamp(32px,7vw,90px)] lg:px-16 lg:pb-16">
        <section className="relative z-10 w-full max-w-[320px] text-center lg:w-[320px]">
          <AVNATitle />

          <p className="mt-8 text-[14px] font-medium leading-[1.4] tracking-[-0.2px] text-[#426354] sm:text-[16px] lg:text-[17px] lg:leading-[1.45]">
            Conocimiento que te
            <br />
            acompaña en cada paso.
          </p>
        </section>

        <section className="relative z-20 w-full max-w-[440px] rounded-[20px] border border-[#e5f0df] bg-[#fbfbf6]/95 p-5 shadow-[0_16px_48px_rgba(0,86,56,0.12)] backdrop-blur-sm sm:rounded-[24px] sm:p-8 lg:w-[440px] lg:p-9">{children}</section>
      </main>

      <img className="pointer-events-none absolute bottom-[-24px] left-[-40px] z-10 hidden h-auto w-[240px] max-w-[28vw] object-contain sm:block lg:bottom-[-40px] lg:left-[-80px] lg:w-[500px] lg:max-w-[32vw]" src="/munequito.png" alt="Muñequito" />
    </div>
  );
}

export default AuthLayout;
