import { useEffect, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { __ } from "@wordpress/i18n";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { ClassicInput } from "../components/classics";
import {
  AddonProvider,
  useAddonContext,
  getDefaultField,
} from "../store/AddonContext";
import apiFetch from "../utils/apiFetch";
import { addonGroupSchema } from "../utils/validation";

// Components
import { BuilderHeader } from "../components/addonBuilder/BuilderHeader";
import { BuilderSidebar } from "../components/addonBuilder/BuilderSidebar";
import { AssignmentRules } from "../components/addonBuilder/AssignmentRules";
import { FieldRow } from "../components/addonBuilder/FieldRow";
import { FormError } from "../components/addonBuilder/FormError";

// ─── Main Builder (inner) ────────────────────────────────────────────────

function BuilderInner() {
  const { state, dispatch } = useAddonContext();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const isEdit = !!params.id;

  const [activeAssignmentType, setActiveAssignmentType] = useState<
    "product" | "category" | "tag"
  >("product");

  // Load existing group
  useEffect(() => {
    if (!isEdit) return;

    const loadGroup = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const data = (await apiFetch({
          path: `optionbay/v1/groups/${params.id}`,
          method: "GET",
        })) as any;

        dispatch({
          type: "SET_GROUP",
          payload: {
            id: data.id,
            title: data.title,
            status: data.status,
            schema: data.schema || [],
            settings: data.settings || {
              layout: "flat",
              priority: 10,
              active: true,
            },
            assignments: (data.assignments || []).map((a: any) => ({
              ...a,
              target_id: parseInt(a.target_id) || 0,
              is_exclusion: !!parseInt(a.is_exclusion),
              priority: parseInt(a.priority) || 10,
            })),
          },
        });
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: __("Failed to load option group.", "optionbay"),
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadGroup();
  }, [isEdit, params.id, dispatch]);

  // Sync initial assignment type when loading an existing group
  useEffect(() => {
    const nonGlobal = state.assignments.filter(
      (a) => a.target_type !== "global",
    );
    if (nonGlobal.length > 0) {
      setActiveAssignmentType(
        nonGlobal[0].target_type as "product" | "category" | "tag",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.settings?.priority]); // Just need to trigger once on load, priority is decent proxy since it's in the payload

  // Save handler
  const handleSave = useCallback(async () => {
    dispatch({ type: "SET_SAVING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "SET_ERRORS", payload: {} });

    try {
      const payload = {
        title: state.title,
        status: state.status,
        schema: state.schema,
        settings: state.settings,
        assignments: state.assignments,
      };

      const result = addonGroupSchema.safeParse(payload);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          fieldErrors[path] = issue.message;
        });
        dispatch({ type: "SET_ERRORS", payload: fieldErrors });
        dispatch({
          type: "SET_ERROR",
          payload: __("Please fix the validation errors below.", "optionbay"),
        });
        dispatch({ type: "SET_SAVING", payload: false });
        return;
      }

      if (isEdit && state.id) {
        await apiFetch({
          path: `optionbay/v1/groups/${state.id}`,
          method: "PUT",
          data: payload,
        });
        dispatch({ type: "MARK_CLEAN" });
      } else {
        const response = (await apiFetch({
          path: "optionbay/v1/groups",
          method: "POST",
          data: payload,
        })) as any;

        if (response.id) {
          navigate(`/option-groups/${response.id}`, { replace: true });
        }
      }
    } catch (err: any) {
      dispatch({
        type: "SET_ERROR",
        payload:
          err?.message || __("Failed to save option group.", "optionbay"),
      });
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [state, isEdit, dispatch, navigate]);

  // Drag-and-drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(state.schema);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    dispatch({ type: "REORDER_FIELDS", payload: items });
  };

  if (state.isLoading) {
    return (
      <div className="optionbay-text-center optionbay-py-[100px]">
        <p className="optionbay-loader-container">
          <span className="spinner is-active optionbay-float-none"></span>
          <br />
          {__("Loading option group...", "optionbay")}
        </p>
      </div>
    );
  }

  return (
    <div className="optionbay-ignore-preflight">
      {/* Error notice */}
      {state.error && (
        <div className="notice notice-error is-dismissible optionbay-mb-5">
          <p>{state.error}</p>
        </div>
      )}

      {/* Top bar */}
      <BuilderHeader handleSave={handleSave} isEdit={isEdit} />

      {/* Main content: 2-column layout */}
      <div className="optionbay-flex optionbay-flex-col lg:optionbay-flex-row optionbay-gap-6 optionbay-items-start">
        {/* Left: Title + Fields */}
        <div className="optionbay-w-full optionbay-flex optionbay-flex-col optionbay-gap-6">
          {/* Group Title */}
          <div>
            <div className="inside !optionbay-p-0">
              <ClassicInput
                className="optionbay-w-full !optionbay-text-[20px] !optionbay-font-semibold !optionbay-py-3 !optionbay-px-4 !optionbay-border !optionbay-border-[#ddd] !optionbay-rounded-md focus:!optionbay-border-[#2271b1] focus:!optionbay-shadow-[0_0_0_1px_#2271b1] focus:!optionbay-outline-none"
                size="large"
                value={state.title}
                onChange={(e) =>
                  dispatch({ type: "SET_TITLE", payload: e.target.value })
                }
                placeholder={__("Enter Option Group Title", "optionbay")}
              />
              <FormError message={state.errors?.title} />
            </div>
          </div>

          {/* Assignment Rules */}
          <AssignmentRules
            activeAssignmentType={activeAssignmentType}
            setActiveAssignmentType={setActiveAssignmentType}
          />

          <div>
            <h2 className="optionbay-ignore-preflight">
              {__("Fields", "optionbay")}
            </h2>
            <p className="description">
              {__("Drag and drop fields to reorder them.", "optionbay")}
            </p>
          </div>

          {/* Fields list with drag-and-drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="fields-list">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="optionbay-flex optionbay-flex-col optionbay-gap-6 optionbay-min-h-[100px]"
                >
                  {state.schema.length === 0 ? (
                    <div className="postbox optionbay-text-center optionbay-px-5 optionbay-py-[60px] optionbay-text-[#999] optionbay-border-dashed optionbay-border-[#c3c4c7] optionbay-rounded-lg">
                      <p className="optionbay-text-base optionbay-mb-2">
                        {__("Your group is empty", "optionbay")}
                      </p>
                      <p className="optionbay-text-[13px]">
                        {__(
                          "Click the field buttons in the sidebar to start building.",
                          "optionbay",
                        )}
                      </p>
                    </div>
                  ) : (
                    state.schema.map((field, index) => (
                      <FieldRow key={field.id} field={field} index={index} />
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Right: Sidebar */}
        <BuilderSidebar />
      </div>
    </div>
  );
}

// ─── Exported Component (wraps with AddonProvider) ───────────────────────

export default function AddonBuilder() {
  return (
    <AddonProvider>
      <BuilderInner />
    </AddonProvider>
  );
}
