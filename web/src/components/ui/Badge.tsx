import { type HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md";
  color?:
    | "primary"
    | "secondary"
    | "accent"
    | "neutral"
    | "info"
    | "success"
    | "warning"
    | "error";
  variant?: "default" | "soft" | "outline";
}

const sizeMap: Record<string, string> = {
  sm: "badge-sm",
  md: "badge-md",
};

const colorMap: Record<string, string> = {
  primary: "badge-primary",
  secondary: "badge-secondary",
  accent: "badge-accent",
  neutral: "badge-neutral",
  info: "badge-info",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
};

const variantMap: Record<string, string> = {
  default: "",
  soft: "badge-soft",
  outline: "badge-outline",
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { size = "md", color = "primary", variant = "default", className, ...rest },
    ref,
  ) => {
    const sizeClass = sizeMap[size];
    const colorClass = colorMap[color];
    const variantClass = variantMap[variant];

    return (
      <span
        ref={ref}
        className={`badge ${sizeClass} ${colorClass} ${variantClass || ""} ${className || ""}`}
        {...rest}
      />
    );
  },
);

Badge.displayName = "Badge";

export default Badge;
