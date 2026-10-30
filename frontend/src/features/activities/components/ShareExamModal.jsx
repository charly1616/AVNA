import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Link } from "react-router";
import { useActivities } from "../hooks/useActivities.js";
import ManageIcon from "@/shared/components/icons/ManageIcon.jsx";
import ResultsIcon from "@/shared/components/icons/ResultsIcon.jsx";

const errorText = (error, fallback) =>
  error?.response?.data?.message || fallback;

const copyToClipboard = async (value) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
};

export function ShareExamModal({ open, onClose }) {
  const { data, isLoading: loading, error } = useActivities({ page: 1, limit: 100 });
  const activities = useMemo(() => data?.activities ?? [], [data]);
  const [selectedId, setSelectedId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [copied, setCopied] = useState("");
  const [copyError, setCopyError] = useState("");

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    setSelectedId((current) => {
      if (current && activities.some((activity) => activity.id === current)) {
        return current;
      }
      return activities[0]?.id ?? "";
    });
  }, [open, activities]);

  const selected = activities.find((activity) => activity.id === selectedId);
  const shareLink = selected?.link ?? "";

  useEffect(() => {
    if (!open || !shareLink) {
      setQrCode("");
      return undefined;
    }

    let active = true;

    QRCode.toDataURL(shareLink, {
      width: 640,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#00583f", light: "#ffffff" },
    })
      .then((dataUrl) => {
        if (active) setQrCode(dataUrl);
      })
      .catch(() => {
        if (active) setQrCode("");
      });

    return () => {
      active = false;
    };
  }, [open, shareLink]);

  useEffect(() => {
    setCopied("");
  }, [selectedId]);

  const handleCopy = useCallback(async (value, label) => {
    if (!value) return;

    try {
      await copyToClipboard(value);
      setCopied(label);
    } catch {
      setCopyError("No se pudo copiar. Selecciona el texto y cópialo manualmente.");
    }
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#062d20]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-exam-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92svh] w-full max-w-[760px] overflow-y-auto rounded-t-[26px] bg-[#fbfbf6] shadow-[0_24px_70px_rgba(0,60,40,0.25)] sm:rounded-[26px]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#e4ebdf] bg-[#fbfbf6]/95 px-5 py-4 backdrop-blur sm:px-7 sm:py-5">
          <div className="min-w-0">
            <p className="text-[.68rem] font-extrabold uppercase tracking-[0.14em] text-[#718078]">
              Compartir
            </p>
            <h2 id="share-exam-title" className="mt-1 text-xl font-black text-[#00583f]">
              Compartir examen
            </h2>
            <p className="mt-1 text-sm text-[#718078]">
              Elige una actividad y comparte su enlace o código QR con tus estudiantes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#54705f] transition hover:bg-[#e8f1e3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#91c83e]"
          >
            <ResultsIcon name="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7">
          {loading && (
            <div className="py-16 text-center text-sm font-bold text-[#718078]">
              Cargando actividades...
            </div>
          )}

          {!loading && error && (
            <div role="alert" className="rounded-2xl border border-[#f0d3cf] bg-[#fff9f8] px-5 py-8 text-center">
              <p className="text-sm font-extrabold text-[#a9352f]">{errorText(error, "No se pudieron cargar las actividades.")}</p>
            </div>
          )}

          {!loading && !error && activities.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#c9ddc4] bg-white px-5 py-10 text-center">
              <ManageIcon name="folder" className="mx-auto h-8 w-8 text-[#91c83e]" />
              <h3 className="mt-3 text-lg font-extrabold text-[#00583f]">
                Aún no tienes exámenes
              </h3>
              <p className="mt-1 text-sm text-[#718078]">
                Crea una actividad para poder compartirla con tus estudiantes.
              </p>
              <Link
                to="/manage"
                onClick={onClose}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#006b4b] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#00583f]"
              >
                Ir a actividades
                <ResultsIcon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          )}

          {!loading && !error && selected && (
            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_240px]">
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-[.68rem] font-extrabold uppercase tracking-[0.12em] text-[#718078]">
                    Examen
                  </span>
                  <select
                    value={selectedId}
                    onChange={(event) => setSelectedId(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#dce8d7] bg-white px-4 text-sm font-extrabold text-[#00583f] shadow-[0_5px_18px_rgba(0,76,51,0.04)] outline-none transition focus:border-[#91c83e] focus:ring-2 focus:ring-[#91c83e]/30"
                  >
                    {activities.map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {activity.title} · {activity.code}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="rounded-2xl border border-[#e4ebdf] bg-white p-4">
                  <p className="text-[.68rem] font-extrabold uppercase tracking-[0.12em] text-[#8aa095]">
                    Enlace para estudiantes
                  </p>
                  <p className="mt-1 break-all font-mono text-sm font-bold text-[#17654d]">
                    {shareLink || "Sin enlace disponible"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(shareLink, "link")}
                      disabled={!shareLink}
                      className="inline-flex items-center gap-2 rounded-full bg-[#006b4b] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#00583f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#91c83e] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ResultsIcon name="check" className="h-3.5 w-3.5" />
                      {copied === "link" ? "Enlace copiado" : "Copiar enlace"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(selected.code, "code")}
                      className="inline-flex items-center gap-2 rounded-full border border-[#dce8d7] bg-white px-4 py-2 text-xs font-extrabold text-[#006b4b] transition hover:border-[#9bc53d] hover:bg-[#f6fbf2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#91c83e]"
                    >
                      <ResultsIcon name="list" className="h-3.5 w-3.5" />
                      {copied === "code" ? "Código copiado" : "Copiar código"}
                    </button>
                    {shareLink && (
                      <a
                        href={shareLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[#dce8d7] bg-white px-4 py-2 text-xs font-extrabold text-[#006b4b] transition hover:border-[#9bc53d] hover:bg-[#f6fbf2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#91c83e]"
                      >
                        <ResultsIcon name="eye" className="h-3.5 w-3.5" />
                        Abrir examen
                      </a>
                    )}
                  </div>
                  {copyError && (
                    <p role="alert" className="mt-3 text-xs font-bold text-[#a9352f]">
                      {copyError}
                    </p>
                  )}
                </div>

                <p className="text-xs leading-relaxed text-[#718078]">
                  Los estudiantes también pueden escribir el código en la pantalla
                  inicial del examen. El enlace abre directamente la actividad.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e4ebdf] bg-white p-4">
                {qrCode ? (
                  <img
                    src={qrCode}
                    alt={`Código QR para ${selected.title}`}
                    className="h-auto w-full max-w-[200px]"
                  />
                ) : (
                  <div className="grid h-[200px] w-[200px] place-items-center rounded-xl bg-[#f4f8f0] text-xs font-bold text-[#8aa095]">
                    Generando QR...
                  </div>
                )}
                <p className="mt-3 text-center text-xs font-bold text-[#54705f]">
                  Escanea para abrir el examen
                </p>
                {qrCode && (
                  <a
                    href={qrCode}
                    download={`qr-${selected.code}.png`}
                    className="mt-2 rounded-full border border-[#dce8d7] px-4 py-2 text-xs font-extrabold text-[#006b4b] transition hover:border-[#9bc53d] hover:bg-[#f6fbf2]"
                  >
                    Descargar QR
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShareExamModal;
