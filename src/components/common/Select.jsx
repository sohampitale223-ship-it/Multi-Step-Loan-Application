import { forwardRef } from "react";
import FormField from "./FormField";

const Select = forwardRef(function Select(
  { id, label, options = [], placeholder, helpText, error, required = false, disabled = false, className = "", ...props },
  ref,
) {
  return (
    <FormField id={id} label={label} helpText={helpText} error={error} required={required}>
      {({ id: fieldId, describedBy }) => (
        <select
          {...props}
          id={fieldId}
          ref={ref}
          className={`form-control form-select ${className}`.trim()}
          required={required}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={[props["aria-describedby"], describedBy].filter(Boolean).join(" ") || undefined}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((option) => {
            const item = typeof option === "object" ? option : { value: option, label: option };
            return <option key={item.value} value={item.value} disabled={item.disabled}>{item.label}</option>;
          })}
        </select>
      )}
    </FormField>
  );
});

export default Select;
