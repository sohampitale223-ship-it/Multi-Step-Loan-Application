import { forwardRef, useState } from "react";
import FormField from "./FormField";

const rules = {
  pan: { clean: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10), mask: (value) => value.length > 4 ? `${"*".repeat(value.length - 4)}${value.slice(-4)}` : value },
  aadhaar: { clean: (value) => value.replace(/\D/g, "").slice(0, 12), mask: (value) => value.length > 4 ? `${"*".repeat(value.length - 4)}${value.slice(-4)}` : value },
};

const MaskedInput = forwardRef(function MaskedInput(
  { maskType = "pan", id, label, helpText, error, required = false, disabled = false, value, defaultValue = "", onChange, onFocus, onBlur, className = "", ...props },
  ref,
) {
  const rule = rules[maskType.toLowerCase()] || rules.pan;
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() => rule.clean(String(defaultValue)));
  const [focused, setFocused] = useState(false);
  const rawValue = rule.clean(String(controlled ? value ?? "" : internalValue));
  const handleChange = (event) => {
    const raw = rule.clean(event.target.value);
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
          inputMode={maskType.toLowerCase() === "aadhaar" ? "numeric" : "text"}
          className={`form-control ${className}`.trim()}
          value={focused ? rawValue : rule.mask(rawValue)}
          onChange={handleChange}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); onBlur?.(event); }}
          maxLength={maskType.toLowerCase() === "aadhaar" ? 12 : 10}
          required={required}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={[props["aria-describedby"], describedBy].filter(Boolean).join(" ") || undefined}
        />
      )}
    </FormField>
  );
});

export default MaskedInput;
