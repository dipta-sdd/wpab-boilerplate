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
  // Helpers to handle arbitrary values safely
  const hClass = height ? (height.includes("[") ? `optionbay-h-${height}` : `optionbay-h-[${height}]`) : "";
  const wClass = width ? (width.includes("[") ? `optionbay-w-${width}` : `optionbay-w-[${width}]`) : "";
  const rClass = borderRadius ? (borderRadius.includes("[") ? `optionbay-rounded-${borderRadius}` : `optionbay-rounded-[${borderRadius}]`) : "optionbay-rounded-[6px]";

  return (
    <div
      className={`
        optionbay-block optionbay-bg-[#e9e9e9] optionbay-relative optionbay-overflow-hidden
        optionbay-animate-shimmer
        ${hClass} ${wClass} ${rClass}
        ${className || ""}
        [&>*]:optionbay-opacity-0
      `}
    >
      {children}
    </div>
  );
};

export default Skeleton;
