export function PageDecorations({ footer = "artwork" }) {
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute -right-[70px] -top-[210px] -z-10 h-[350px] w-[550px] rotate-[-8deg] rounded-b-[50%] border-[26px] border-[#e5f0df] max-sm:w-[300px] max-sm:border-[18px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-[110px] -top-[110px] -z-10 h-[220px] w-[220px] rounded-full bg-[#006341] shadow-[inset_-25px_-10px_0_#8fc88b] max-sm:-left-[95px] max-sm:-top-[105px] max-sm:h-[180px] max-sm:w-[180px]" />
      {footer === "artwork" ? (
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 -z-10 w-full">
          <picture className="block w-full">
            <source media="(max-width: 640px)" srcSet="/Munequito_pequeno.png" />
            <img src="/Munequito_grande.png" alt="" className="block w-full aspect-[2172/724] object-fill max-sm:aspect-[1047/438]" />
          </picture>
        </div>
      ) : footer === "waves" ? (
        <div aria-hidden="true" className="pointer-events-none fixed -bottom-[35px] left-[-10%] -z-10 h-[170px] w-[120%] overflow-hidden">
          <div className="absolute -left-[10%] top-[12px] h-[155px] w-[125%] rotate-[-3deg] rounded-[50%] bg-[#a6d8a0]" />
          <div className="absolute -left-[22%] top-[48px] h-[155px] w-[145%] rotate-[3deg] rounded-[50%] bg-[#75be79]" />
          <div className="absolute -left-[10%] top-[88px] h-[160px] w-[125%] rotate-[-2deg] rounded-[50%] bg-[#08724f]" />
        </div>
      ) : null}
    </>
  );
}

export default PageDecorations;
