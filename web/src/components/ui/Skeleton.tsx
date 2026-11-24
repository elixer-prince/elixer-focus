import { forwardRef } from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animation?: boolean;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ animation = true, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-base-300 shrink-0 rounded-lg ${animation ? "animate-pulse" : ""} ${className || ""}`}
        role="status"
        aria-label="Loading"
        {...rest}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

export default Skeleton;
