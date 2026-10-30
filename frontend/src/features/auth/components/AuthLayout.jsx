import DnaBackground from "./DnaBackground.jsx";
import UniversityLogo from "@/shared/components/brand/UniversityLogo.jsx";
import AVNATitle from "@/shared/components/brand/AVNATitle.jsx";

export function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fbfbf6] text-[#005638]">
      <DnaBackground />
      <UniversityLogo placement="auth" />
      <AVNATitle />
      {children}
    </div>
  );
}

export default AuthLayout;
