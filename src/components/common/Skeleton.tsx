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
      className={`optionbay-skeleton ${height ? `optionbay-h-${height}` : ""} ${
        width ? `optionbay-w-${width}` : ""
      } ${borderRadius ? `optionbay-br-${borderRadius}` : ""} ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
};

export default Skeleton;
