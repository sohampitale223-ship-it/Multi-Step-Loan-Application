export default function ErrorMessage({ error, id, className = "" }) {
  const message = typeof error === "object" ? error?.message : error;

  if (!message) return null;

  return (
    <p id={id} className={`form-error ${className}`.trim()} role="alert" aria-live="polite">
      <span aria-hidden="true">⚠</span> {message}
    </p>
  );
}
