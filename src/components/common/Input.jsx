import { forwardRef } from "react";
import FormField from "./FormField";

const Input = forwardRef(function Input(
  { id, label, helpText, error, required = false, disabled = false, className = "", ...props },
  ref,
) {
  return (
    <FormField id={id} label={label} helpText={helpText} error={error} required={required}>
      {({ id: fieldId, describedBy }) => (
        <input
          {...props}
          id={fieldId}
          ref={ref}
          className={`form-control ${className}`.trim()}
          required={required}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={[props["aria-describedby"], describedBy].filter(Boolean).join(" ") || undefined}
        />
      )}
    </FormField>
  );
});

export default Input;
