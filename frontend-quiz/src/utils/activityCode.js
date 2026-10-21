/**
 * The quiz can be opened with the code of an activity. The teacher copies only
 * that code, so it has to work pasted on its own as well as inside a link.
 *
 * The codes are always lowercase, so the value is normalized here: a code
 * copied with spaces, in upper case or inside a full link always works.
 */
export const extractActivityCode = (raw) => {
  const value = String(raw ?? "").trim();
  if (!value) return "";

  try {
    const url = new URL(value);
    const fromQuery = url.searchParams.get("activity");
    if (fromQuery) return fromQuery.trim().toLowerCase();

    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] ?? "";
    return last === "a" ? "" : last.toLowerCase();
  } catch {
    return (
      value
        .replace(/\/+$/, "")
        .split("/")
        .filter(Boolean)
        .pop()
        ?.toLowerCase() ?? ""
    );
  }
};

/**
 * Reads the code from the current URL: /a/<code> or /?activity=<code>.
 */
export const readActivityCode = () => {
  if (typeof window === "undefined") return "";

  const fromQuery = new URLSearchParams(window.location.search).get("activity");
  if (fromQuery) return fromQuery.trim().toLowerCase();

  const segments = window.location.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "";

  return last === "a" ? "" : last.toLowerCase();
};

export default extractActivityCode;
