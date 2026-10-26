const ICONS = {
  book: "📘",
  spell: "✨",
  calculator: "🧮",
  palette: "🎨",
  bulb: "💡",
  flask: "🧪",
  puzzle: "🧩",
  brain: "🧠",
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const activityIcon = (icon) => ICONS[icon] ?? "✦";

export const activityColor = (color) =>
  typeof color === "string" && HEX_COLOR.test(color) ? color : undefined;

export default activityIcon;
