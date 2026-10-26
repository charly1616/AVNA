export default function QuestionMedia({ media, compact = false, className = "" }) {
  const images = (Array.isArray(media) ? media : []).filter((item) => item?.url);
  if (images.length === 0) return null;

  return (
    <span className={`media-list ${className}`.trim()}>
      {images.map((item) => (
        <span
          key={item.url || item.storageKey}
          className={`media-frame ${compact ? "compact" : ""}`}
        >
          <img
            src={item.url}
            alt={item.altText || ""}
            loading="lazy"
            width={item.width || undefined}
            height={item.height || undefined}
          />
        </span>
      ))}
    </span>
  );
}
