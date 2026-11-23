import { forwardRef } from "react";

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: "xs" | "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "neutral" | "accent";
}

const sizeMap: Record<"xs" | "sm" | "md" | "lg", number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
};

const colorMap: Record<"primary" | "secondary" | "neutral" | "accent", string> =
  {
    primary: "text-primary",
    secondary: "text-secondary",
    neutral: "text-neutral",
    accent: "text-accent",
  };

const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ size = "md", color = "primary", className, ...rest }, ref) => {
    const dimension = sizeMap[size];
    const colorClass = colorMap[color];

    return (
      <svg
        ref={ref}
        className={`animate-spin ${colorClass} ${className || ""}`}
        width={dimension}
        height={dimension}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...rest}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    );
  },
);

Spinner.displayName = "Spinner";

export default Spinner;
