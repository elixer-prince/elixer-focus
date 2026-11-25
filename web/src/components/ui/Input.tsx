import { type InputHTMLAttributes, forwardRef, useId } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "sm" | "md" | "lg";
  error?: boolean;
  label?: string;
  helperText?: string;
}

const sizeMap: Record<string, string> = {
  sm: "input-sm",
  md: "input-md",
  lg: "input-lg",
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputSize = "md",
      error = false,
      label,
      helperText,
      className,
      id,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...rest
    },
    ref,
  ) => {
    const sizeClass = sizeMap[inputSize];
    const generatedId = useId();
    const inputId =
      id ??
      (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    const helperTextId = helperText
      ? `${inputId ?? generatedId}-helper-text`
      : undefined;
    const describedBy = [ariaDescribedBy, helperTextId]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            <span className="label-text">{label}</span>
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : ariaInvalid}
          aria-describedby={describedBy || undefined}
          type="text"
          className={`input input-primary ${sizeClass} ${error ? "input-error" : ""} ${className || ""}`}
          {...rest}
        />
        {helperText && (
          <div id={helperTextId} className="label">
            <span className={`label-text-alt ${error ? "text-error" : ""}`}>
              {helperText}
            </span>
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
