import { Link } from "react-router";

const placementClasses = {
  header: "relative flex shrink-0 items-center",
  auth: "absolute left-1/2 top-[calc(env(safe-area-inset-top)+10px)] z-10 flex w-full -translate-x-1/2 justify-center px-4",
};

export function UniversityLogo({ placement = "header" }) {
  return (
    <div className={placementClasses[placement] || placementClasses.header}>
      <Link to="/" aria-label="Ir al inicio" className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#006341]">
        <img
          src="/universidad_logo.png"
          alt="Universidad Simón Bolívar"
          className="h-[54px] w-[min(260px,62vw)] shrink-0 object-contain object-left drop-shadow-sm sm:h-[66px] sm:w-[310px]"
        />
      </Link>
    </div>
  );
}

export default UniversityLogo;
