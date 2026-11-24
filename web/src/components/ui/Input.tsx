import { type InputHTMLAttributes, forwardRef } from "react";

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
      ...rest
    },
    ref,
  ) => {
    const sizeClass = sizeMap[inputSize];
    const inputId =
      id || label
        ? `input-${label?.toLowerCase().replace(/\s+/g, "-") || ""}`
        : undefined;

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
          type="text"
          className={`input input-primary ${sizeClass} ${error ? "input-error" : ""} ${className || ""}`}
          {...rest}
        />
        {helperText && (
          <label className="label">
            <span className={`label-text-alt ${error ? "text-error" : ""}`}>
              {helperText}
            </span>
          </label>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
