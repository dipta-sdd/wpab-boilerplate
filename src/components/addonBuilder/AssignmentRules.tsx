import React from "react";
import { __ } from "@wordpress/i18n";
import { ClassicMultiSelect } from "../classics";
import { ClassicSettingsTable } from "../classics/ClassicSettingsTable";
import { useAddonContext, Assignment } from "../../store/AddonContext";
import { renderProductOption } from "./utils";
import { FormError } from "./FormError";

/**
 * AssignmentRules — Redesigned with 3 sections:
 *
 * 1. **Visibility**: Radio toggle — Global (all products) vs Targeted
 * 2. **Reach**: Inclusion search fields (products, categories, tags) — only when targeted
 * 3. **Exceptions**: Exclusion search fields (products, categories, tags) — always visible
 */
export const AssignmentRules: React.FC = () => {
  const { state, dispatch } = useAddonContext();

  const isGlobal = state.assignments.some((a) => a.target_type === "global");

  // ─── Helpers to read/write specific slices of the assignments array ───

  /** Get target IDs for a specific type and inclusion/exclusion status */
  const getIds = (targetType: string, isExclusion: boolean): number[] =>
    state.assignments
      .filter(
        (a) =>
          a.target_type === targetType && a.is_exclusion === isExclusion,
      )
      .map((a) => a.target_id);

  /** Replace all assignments of a given type+exclusion status with new IDs */
  const setIds = (
    targetType: Assignment["target_type"],
    isExclusion: boolean,
    ids: number[],
  ) => {
    // Keep everything that doesn't match this type+exclusion combo
    const other = state.assignments.filter(
      (a) =>
        !(a.target_type === targetType && a.is_exclusion === isExclusion),
    );

    // Build new rows for the incoming IDs
    const newRows: Assignment[] = ids.map((id) => ({
      target_type: targetType,
      target_id: id,
      is_exclusion: isExclusion,
      priority: state.settings.priority,
    }));

    dispatch({
      type: "SET_ASSIGNMENTS",
      payload: [...other, ...newRows],
    });
  };

  // ─── Visibility toggling ───

  const setGlobal = () => {
    // Keep only exclusion assignments + add the global row
    const exclusions = state.assignments.filter((a) => a.is_exclusion);
    dispatch({
      type: "SET_ASSIGNMENTS",
      payload: [
        {
          target_type: "global",
          target_id: 0,
          is_exclusion: false,
          priority: state.settings.priority,
        },
        ...exclusions,
      ],
    });
  };

  const setTargeted = () => {
    // Remove global rows, keep everything else (exclusions survive)
    dispatch({
      type: "SET_ASSIGNMENTS",
      payload: state.assignments.filter((a) => a.target_type !== "global"),
    });
  };

  // ─── Shared multi-select row renderer ───

  const renderSearchFields = (isExclusion: boolean) => (
    <div className="optionbay-flex optionbay-flex-col optionbay-gap-4">
      {/* Products */}
      <div>
        <label className="optionbay-block optionbay-text-[13px] optionbay-font-semibold optionbay-mb-1">
          {__("Products", "optionbay")}
        </label>
        <ClassicMultiSelect
          value={getIds("product", isExclusion)}
          onChange={(ids) =>
            setIds("product", isExclusion, ids as number[])
          }
          endpoint="/optionbay/v1/resources/products"
          placeholder={__("Search products…", "optionbay")}
          renderOption={renderProductOption}
          size="regular"
        />
      </div>

      {/* Categories */}
      <div>
        <label className="optionbay-block optionbay-text-[13px] optionbay-font-semibold optionbay-mb-1">
          {__("Categories", "optionbay")}
        </label>
        <ClassicMultiSelect
          value={getIds("category", isExclusion)}
          onChange={(ids) =>
            setIds("category", isExclusion, ids as number[])
          }
          endpoint="/optionbay/v1/resources/categories"
          placeholder={__("Search categories…", "optionbay")}
          size="regular"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="optionbay-block optionbay-text-[13px] optionbay-font-semibold optionbay-mb-1">
          {__("Tags", "optionbay")}
        </label>
        <ClassicMultiSelect
          value={getIds("tag", isExclusion)}
          onChange={(ids) =>
            setIds("tag", isExclusion, ids as number[])
          }
          endpoint="/optionbay/v1/resources/tags"
          placeholder={__("Search tags…", "optionbay")}
          size="regular"
        />
      </div>
    </div>
  );

  // ─── Render ───

  return (
    <ClassicSettingsTable
      title={__("Assignment Rules", "optionbay")}
      description={__(
        "Control where this option group appears on your store.",
        "optionbay",
      )}
      fields={[
        // ── Section 1: Visibility ──
        {
          label: __("Visibility", "optionbay"),
          tooltip: __(
            "Choose whether this option group appears on all products or only specific ones.",
            "optionbay",
          ),
          render: () => (
            <div className="optionbay-flex optionbay-flex-col optionbay-gap-2">
              <label className="optionbay-flex optionbay-items-center optionbay-gap-2 optionbay-cursor-pointer">
                <input
                  type="radio"
                  name="ob-visibility"
                  checked={isGlobal}
                  onChange={() => setGlobal()}
                />
                <span>{__("Apply to all products", "optionbay")}</span>
              </label>
              <label className="optionbay-flex optionbay-items-center optionbay-gap-2 optionbay-cursor-pointer">
                <input
                  type="radio"
                  name="ob-visibility"
                  checked={!isGlobal}
                  onChange={() => setTargeted()}
                />
                <span>
                  {__(
                    "Apply to specific products, categories, or tags",
                    "optionbay",
                  )}
                </span>
              </label>
            </div>
          ),
        },

        // ── Section 2: Reach (inclusions — only when targeted) ──
        ...(!isGlobal
          ? [
              {
                label: __("Reach", "optionbay"),
                tooltip: __(
                  "Select which products, categories, or tags this option group should appear on.",
                  "optionbay",
                ),
                render: () => (
                  <div>
                    {renderSearchFields(false)}
                    <FormError message={state.errors?.["assignments"]} />
                    <FormError
                      message={state.errors?.["assignments.0.target_id"]}
                    />
                  </div>
                ),
              },
            ]
          : []),

        // ── Section 3: Exceptions (exclusions — always visible) ──
        {
          label: __("Exceptions", "optionbay"),
          tooltip: __(
            "Exclude specific products, categories, or tags even if they match the visibility rules above.",
            "optionbay",
          ),
          render: () => renderSearchFields(true),
        },
      ]}
    />
  );
};
