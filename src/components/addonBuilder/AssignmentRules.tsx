import React from "react";
import { __ } from "@wordpress/i18n";
import {
  ClassicCheckbox,
  ClassicSelect,
  ClassicMultiSelect,
} from "../classics";
import { ClassicSettingsTable } from "../classics/ClassicSettingsTable";
import { useAddonContext } from "../../store/AddonContext";
import { renderProductOption } from "./utils";

interface AssignmentRulesProps {
  activeAssignmentType: "product" | "category" | "tag";
  setActiveAssignmentType: (type: "product" | "category" | "tag") => void;
}

export const AssignmentRules: React.FC<AssignmentRulesProps> = ({
  activeAssignmentType,
  setActiveAssignmentType,
}) => {
  const { state, dispatch } = useAddonContext();

  return (
    <ClassicSettingsTable
      title={__("Assignment Rules", "optionbay")}
      description={__(
        "Choose where this option group should be displayed.",
        "optionbay",
      )}
      fields={[
        {
          label: __("Global Assignment", "optionbay"),
          tooltip: __(
            "If enabled, these options will appear on every product in your store.",
            "optionbay",
          ),
          render: () => (
            <ClassicCheckbox
              label={__("Enable for all products", "optionbay")}
              checked={state.assignments.some((a) => a.target_type === "global")}
              onChange={(checked) => {
                if (checked) {
                  dispatch({
                    type: "SET_ASSIGNMENTS",
                    payload: [
                      {
                        target_type: "global",
                        target_id: 0,
                        is_exclusion: false,
                        priority: state.settings.priority,
                      },
                    ],
                  });
                } else {
                  dispatch({
                    type: "SET_ASSIGNMENTS",
                    payload: state.assignments.filter(
                      (a) => a.target_type !== "global",
                    ),
                  });
                }
              }}
            />
          ),
        },
        ...(!state.assignments.some((a) => a.target_type === "global")
          ? [
              {
                label: __("Assign By", "optionbay"),
                render: () => (
                  <div className="optionbay-max-w-[300px]">
                    <ClassicSelect
                      value={activeAssignmentType}
                      differentDropdownWidth
                      onChange={(val) => {
                        setActiveAssignmentType(val as any);
                        dispatch({
                          type: "SET_ASSIGNMENTS",
                          payload: [],
                        });
                      }}
                      options={[
                        {
                          value: "product",
                          label: __("Products", "optionbay"),
                        },
                        {
                          value: "category",
                          label: __("Categories", "optionbay"),
                        },
                        { value: "tag", label: __("Tags", "optionbay") },
                      ]}
                    />
                  </div>
                ),
              },
              {
                label:
                  activeAssignmentType === "product"
                    ? __("Select Products", "optionbay")
                    : activeAssignmentType === "category"
                    ? __("Select Categories", "optionbay")
                    : __("Select Tags", "optionbay"),
                render: () => (
                  <div className="optionbay-max-w-[600px]">
                    {activeAssignmentType === "product" && (
                      <ClassicMultiSelect
                        value={state.assignments
                          .filter((a) => a.target_type === "product")
                          .map((a) => a.target_id)}
                        onChange={(ids) => {
                          const prodAssignments = (ids as number[]).map(
                            (id) => ({
                              target_type: "product" as const,
                              target_id: id,
                              is_exclusion: false,
                              priority: state.settings.priority,
                            }),
                          );
                          dispatch({
                            type: "SET_ASSIGNMENTS",
                            payload: prodAssignments,
                          });
                        }}
                        endpoint="/optionbay/v1/resources/products"
                        placeholder={__("Search products...", "optionbay")}
                        renderOption={renderProductOption}
                        size="regular"
                      />
                    )}
                    {activeAssignmentType === "category" && (
                      <ClassicMultiSelect
                        value={state.assignments
                          .filter((a) => a.target_type === "category")
                          .map((a) => a.target_id)}
                        onChange={(ids) => {
                          const catAssignments = (ids as number[]).map(
                            (id) => ({
                              target_type: "category" as const,
                              target_id: id,
                              is_exclusion: false,
                              priority: state.settings.priority,
                            }),
                          );
                          dispatch({
                            type: "SET_ASSIGNMENTS",
                            payload: catAssignments,
                          });
                        }}
                        endpoint="/optionbay/v1/resources/categories"
                        placeholder={__("Search categories...", "optionbay")}
                        size="regular"
                      />
                    )}
                    {activeAssignmentType === "tag" && (
                      <ClassicMultiSelect
                        value={state.assignments
                          .filter((a) => a.target_type === "tag")
                          .map((a) => a.target_id)}
                        onChange={(ids) => {
                          const tagAssignments = (ids as number[]).map(
                            (id) => ({
                              target_type: "tag" as const,
                              target_id: id,
                              is_exclusion: false,
                              priority: state.settings.priority,
                            }),
                          );
                          dispatch({
                            type: "SET_ASSIGNMENTS",
                            payload: tagAssignments,
                          });
                        }}
                        endpoint="/optionbay/v1/resources/tags"
                        placeholder={__("Search tags...", "optionbay")}
                        size="regular"
                      />
                    )}
                  </div>
                ),
              },
            ]
          : []),
      ]}
    />
  );
};
