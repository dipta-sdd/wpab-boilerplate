import { FC, ReactNode } from "react";

interface SkeletonProps {
  height?: string;
  width?: string;
  borderRadius?: string;
  children?: ReactNode;
  className?: string;
}

const Skeleton: FC<SkeletonProps> = ({
  height,
  width,
  borderRadius,
  children,
  className,
}) => {
  return (
    <div
      className={`wpab-skeleton ${
        height ? `wpab-h-${height}` : ""
      } ${width ? `wpab-w-${width}` : ""} ${
        borderRadius ? `wpab-br-${borderRadius}` : ""
      } ${className || ""}`}
    >
      {children}
    </div>
  );
};

export default Skeleton;
