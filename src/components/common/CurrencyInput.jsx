import { forwardRef, useState } from "react";
import FormField from "./FormField";
import { formatINR } from "./currencyUtils";

const CurrencyInput = forwardRef(function CurrencyInput(
  { id, label, helpText, error, required = false, disabled = false, value, defaultValue = "", onChange, className = "", ...props },
  ref,
) {
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() => String(defaultValue).replace(/\D/g, ""));
  const rawValue = controlled ? String(value ?? "").replace(/\D/g, "") : internalValue;

  const handleChange = (event) => {
    const raw = event.target.value.replace(/\D/g, "");
    if (!controlled) setInternalValue(raw);
    onChange?.({ ...event, target: { ...event.target, name: event.target.name, value: raw } });
  };

  return (
    <FormField id={id} label={label} helpText={helpText} error={error} required={required}>
      {({ id: fieldId, describedBy }) => (
        <input
          {...props}
          id={fieldId}
          ref={ref}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={`form-control ${className}`.trim()}
          value={formatINR(rawValue)}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={[props["aria-describedby"], describedBy].filter(Boolean).join(" ") || undefined}
        />
      )}
    </FormField>
  );
});

export default CurrencyInput;
