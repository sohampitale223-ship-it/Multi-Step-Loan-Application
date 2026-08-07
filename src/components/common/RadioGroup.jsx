import { forwardRef, useId } from "react";
import ErrorMessage from "./ErrorMessage";

const RadioGroup = forwardRef(function RadioGroup(
  { id, legend, label, name, options = [], value, defaultValue, onChange, onBlur, error, required = false, disabled = false, layout = "vertical", className = "" },
  ref,
) {
  const generatedId = useId().replace(/:/g, "");
  const groupId = id || `radio-${generatedId}`;
  const errorId = error ? `${groupId}-error` : undefined;

  return (
    <fieldset className={`radio-fieldset ${className}`.trim()} disabled={disabled} aria-invalid={error ? "true" : "false"} aria-describedby={errorId}>
      <legend className="form-label">
        {legend || label}
        {required && <span className="form-required" aria-hidden="true"> *</span>}
        {required && <span className="sr-only"> (required)</span>}
      </legend>
      <div className={`radio-options radio-options--${layout}`}>
        {options.map((option, index) => {
          const item = typeof option === "object" ? option : { value: option, label: option };
          const optionId = `${groupId}-${index}`;
          return (
            <label className="choice-label" htmlFor={optionId} key={item.value}>
              <input
                ref={index === 0 ? ref : undefined}
                id={optionId}
                type="radio"
                name={name}
                value={item.value}
                checked={value !== undefined ? value === item.value : undefined}
                defaultChecked={value === undefined ? defaultValue === item.value : undefined}
                onChange={onChange}
                onBlur={onBlur}
                required={required && index === 0}
                disabled={disabled || item.disabled}
              />
              <span>{item.label}</span>
            </label>
          );
        })}
      </div>
      <ErrorMessage id={errorId} error={error} />
    </fieldset>
  );
});

export default RadioGroup;
