import { useId } from "react";
import ErrorMessage from "./ErrorMessage";

export default function FormField({
  id,
  label,
  required = false,
  helpText,
  error,
  children,
  className = "",
}) {
  const generatedId = useId();
  const fieldId = id || `field-${generatedId.replace(/:/g, "")}`;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  const child = typeof children === "function"
    ? children({ id: fieldId, helpId, errorId, describedBy })
    : children;

  return (
    <div className={`form-field ${className}`.trim()}>
      {label && (
        <label className="form-label" htmlFor={fieldId}>
          {label}
          {required && <span className="form-required" aria-hidden="true"> *</span>}
          {required && <span className="sr-only"> (required)</span>}
        </label>
      )}
      {child}
      {helpText && <p className="form-help" id={helpId}>{helpText}</p>}
      <ErrorMessage id={errorId} error={error} />
    </div>
  );
}
