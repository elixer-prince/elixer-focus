import { type ButtonHTMLAttributes, forwardRef } from "react";
import Spinner from "./Spinner";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "xs" | "sm" | "md" | "lg";
  color?: "primary" | "ghost" | "outline" | "secondary" | "accent" | "neutral";
  loading?: boolean;
}

const sizeMap: Record<string, string> = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

const colorMap: Record<string, string> = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  outline: "btn-outline",
  secondary: "btn-secondary",
  accent: "btn-accent",
  neutral: "btn-neutral",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      size = "md",
      color = "primary",
      loading = false,
      disabled = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const sizeClass = sizeMap[size];
    const colorClass = colorMap[color];

    return (
      <button
        ref={ref}
        type="button"
        className={`btn ${sizeClass} ${colorClass} ${className || ""}`}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && <Spinner size={size === "xs" ? "xs" : "sm"} />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
