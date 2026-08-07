import { forwardRef, useId } from "react";
import ErrorMessage from "./ErrorMessage";

const Checkbox = forwardRef(function Checkbox(
  { id, label, description, error, disabled = false, className = "", ...props },
  ref,
) {
  const generatedId = useId().replace(/:/g, "");
  const fieldId = id || `checkbox-${generatedId}`;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className={`checkbox-field ${className}`.trim()}>
      <label className="choice-label" htmlFor={fieldId}>
        <input
          {...props}
          ref={ref}
          id={fieldId}
          type="checkbox"
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
        />
        <span>{label}</span>
      </label>
      {description && <p id={descriptionId} className="form-help checkbox-description">{description}</p>}
      <ErrorMessage id={errorId} error={error} />
    </div>
  );
});

export default Checkbox;
