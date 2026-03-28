import { z } from "zod";
import { __ } from "@wordpress/i18n";

export const conditionRuleSchema = z.object({
  target_field_id: z.string().min(1, { message: __("Target field is required", "optionbay") }),
  operator: z.string(),
  value: z.string().min(1, { message: __("Rule value is required", "optionbay") }),
});

export const fieldConditionsSchema = z.object({
  status: z.enum(["active", "inactive"]),
  action: z.enum(["show", "hide"]),
  match: z.enum(["ALL", "ANY"]),
  rules: z.array(conditionRuleSchema),
}).superRefine((data, ctx) => {
  if (data.status === "active" && data.rules.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: __("At least one rule is required when logic is active", "optionbay"),
      path: ["rules"],
    });
  }
});

export const fieldOptionSchema = z.object({
  label: z.string().min(1, { message: __("Choice label is required", "optionbay") }),
  value: z.string().min(1, { message: __("Choice value is required", "optionbay") }),
  price_type: z.string(),
  price: z.number().optional(),
  weight: z.number().optional(),
});

export const fieldDefinitionSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string().min(1, { message: __("Field label is required", "optionbay") }),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean(),
  class_name: z.string().optional(),
  price: z.number().optional(),
  weight: z.number().optional(),
  options: z.array(fieldOptionSchema).optional(),
  conditions: fieldConditionsSchema,
}).superRefine((data, ctx) => {
  if (["select", "radio", "checkbox"].includes(data.type)) {
    if (!data.options || data.options.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: __("At least one choice is required", "optionbay"),
        path: ["options"],
      });
    }
  }
});

export const addonGroupSchema = z.object({
  title: z.string().min(1, { message: __("Group Title is required", "optionbay") }),
  status: z.enum(["publish", "draft"]),
  schema: z.array(fieldDefinitionSchema),
  // settings and assignments are loosely typed here as they are mostly UI driven rules without critical string lengths
});
