import React from "react";

interface ClassicTooltipProps {
  tip: string;
  className?: string;
}

/**
 * Renders the WooCommerce-native (?) help tip icon.
 * Uses the `woocommerce-help-tip` class + `data-tip` attribute
 * which WC's bundled JS (tipTip) automatically turns into a tooltip.
 */
export const ClassicTooltip: React.FC<ClassicTooltipProps> = ({
  tip,
  className = "",
}) => {
  return (
    <span
      className={`woocommerce-help-tip ${className}`}
      data-tip={tip}
    />
  );
};
