import React from "react";

const ShareGlyph = () => (
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

const actionTones = {
  green: "bg-gradient-to-r from-[#006341] to-[#08734a] text-white",
  yellow: "bg-gradient-to-r from-[#ffd43b] to-[#ffce2c] text-[#405b0c]",
  lime: "bg-gradient-to-r from-[#b8dcb2] to-[#9bc53d] text-[#005638]",
};

const arrowTones = {
  green: "bg-[#18a95d]/55 text-white",
  yellow: "bg-[#7b8b00]/45 text-white",
  lime: "bg-[#005638]/45 text-[#005638]",
};

export function HomeActionCard({ action, onShare }) {
  const Action = action.to ? Link : "button";
  const handleClick = action.action === "share" ? onShare : undefined;

  return (
    <Action
      key={action.label}
      {...(action.to ? { to: action.to } : { type: "button", onClick: handleClick })}
      className={`group grid min-h-[88px] w-full grid-cols-[64px_minmax(0,1fr)_42px] items-center gap-3 rounded-[28px] px-4 py-3 text-left transition duration-200 hover:-translate-y-1 hover:brightness-105 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#9bc53d] sm:min-h-[105px] sm:grid-cols-[85px_minmax(0,1fr)_48px] sm:gap-4 sm:px-6 sm:py-4 lg:min-h-[clamp(84px,14vh,155px)] lg:grid-cols-[minmax(80px,125px)_1fr_64px] lg:gap-[clamp(12px,2vw,28px)] lg:rounded-full lg:px-[clamp(20px,3vw,42px)] lg:py-[clamp(8px,1.6vh,16px)] ${actionTones[action.tone]}`}
    >
      <span className="grid place-items-center">
        {action.image ? (
          <img src={action.image} alt="" className="block h-auto w-[56px] max-h-[65px] object-contain sm:w-[78px] sm:max-h-[78px] lg:w-full lg:max-w-[125px] lg:max-h-[clamp(52px,8.5vh,110px)]" />
        ) : (
          <span className="grid h-[56px] w-[56px] place-items-center text-[#005638] sm:h-[78px] sm:w-[78px] lg:h-[clamp(52px,8.5vh,110px)] lg:w-[clamp(52px,8.5vh,110px)]">
            {action.icon}
          </span>
        )}
      </span>
      <span className="text-[clamp(19px,5vw,26px)] font-extrabold leading-[1.12] sm:text-[26px] lg:text-[clamp(21px,2.1vw,32px)]">{action.label}</span>
      <span className={`grid h-10 w-10 place-items-center justify-self-end rounded-full text-2xl transition-transform group-hover:translate-x-1 sm:h-12 sm:w-12 sm:text-3xl lg:h-[clamp(48px,5vw,66px)] lg:w-[clamp(48px,5vw,66px)] lg:text-[43px] ${arrowTones[action.tone]}`} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
      </span>
    </Action>
  );
}

export default HomeActionCard;
