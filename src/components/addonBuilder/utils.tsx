import React from "react";
import { MultiSelectOption } from "../common/MultiSelect";

/** Custom render for product options in ClassicMultiSelect (shows thumbnail, ID, SKU) */
export function renderProductOption(option: MultiSelectOption) {
  const opt = option as any;
  return (
    <div className="optionbay-flex optionbay-items-center optionbay-gap-2">
      {opt.image && (
        <img
          src={opt.image}
          alt=""
          className="optionbay-w-8 optionbay-h-8 optionbay-object-cover optionbay-rounded optionbay-shrink-0"
        />
      )}
      <div className="optionbay-min-w-0">
        <div className="optionbay-font-medium optionbay-leading-tight">
          {opt.label}
        </div>
        <div className="optionbay-text-[11px] optionbay-text-[#888] optionbay-leading-tight">
          ID: {opt.value}
          {opt.sku ? ` • SKU: ${opt.sku}` : ""}
        </div>
      </div>
    </div>
  );
}
