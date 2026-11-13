import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, ImageOff, X } from "lucide-react";
import { getIncidentAttachmentUrl } from "../../services/IncidentService.js";

const isImage = (attachment) => (attachment.contentType || "").startsWith("image/");
const sizeLabel = (bytes) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

function Thumb({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="gallery-fail"><ImageOff size={22} aria-hidden="true" />No se pudo cargar</span>;
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

export default function Gallery({ incidentId, attachments }) {
  const images = attachments.filter(isImage);
  const files = attachments.filter((attachment) => !isImage(attachment));
  const [index, setIndex] = useState(null);
  const dialogRef = useRef(null);
  const urlOf = (attachment) => getIncidentAttachmentUrl(incidentId, attachment.id);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) dialog.showModal();
    if (index === null && dialog.open) dialog.close();
  }, [index]);

  function onKeyDown(event) {
    if (event.key === "ArrowRight") setIndex((current) => (current + 1) % images.length);
    if (event.key === "ArrowLeft") setIndex((current) => (current - 1 + images.length) % images.length);
  }

  return (
    <>
      {images.length > 0 && (
        <ul className={`gallery gallery-${Math.min(images.length, 3)}`}>
          {images.map((image, position) => (
            <li key={image.id}>
              <button type="button" className="gallery-item" onClick={() => setIndex(position)} aria-label={`Ampliar ${image.filename}`}>
                <Thumb src={urlOf(image)} alt={image.filename} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file) => (
            <li key={file.id}>
              <a href={urlOf(file)} target="_blank" rel="noreferrer" className="file-chip">
                <FileText size={18} aria-hidden="true" />
                <span>{file.filename}</span>
                <small>{sizeLabel(file.size)}</small>
              </a>
            </li>
          ))}
        </ul>
      )}
      <dialog ref={dialogRef} className="lightbox" onClose={() => setIndex(null)} onKeyDown={onKeyDown} onClick={(event) => { if (event.target === dialogRef.current) setIndex(null); }}>
        {index !== null && images[index] && (
          <figure>
            <img src={urlOf(images[index])} alt={images[index].filename} />
            <figcaption>{images[index].filename} <span>({index + 1}/{images.length})</span></figcaption>
          </figure>
        )}
        <button type="button" className="lightbox-btn lightbox-close" onClick={() => setIndex(null)} aria-label="Cerrar"><X size={22} aria-hidden="true" /></button>
        {images.length > 1 && (
          <>
            <button type="button" className="lightbox-btn lightbox-prev" onClick={() => setIndex((current) => (current - 1 + images.length) % images.length)} aria-label="Anterior"><ChevronLeft size={26} aria-hidden="true" /></button>
            <button type="button" className="lightbox-btn lightbox-next" onClick={() => setIndex((current) => (current + 1) % images.length)} aria-label="Siguiente"><ChevronRight size={26} aria-hidden="true" /></button>
          </>
        )}
      </dialog>
    </>
  );
}
