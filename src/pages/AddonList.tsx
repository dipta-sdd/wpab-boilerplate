import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { __, sprintf } from "@wordpress/i18n";
import { ClassicButton, ClassicCheckbox } from "../components/classics";
import { useWpabStore } from "../store/wpabStore";
import apiFetch from "../utils/apiFetch";

interface GroupListItem {
  id: number;
  title: string;
  status: string;
  field_count: number;
  settings: {
    layout: string;
    priority: number;
    active: boolean;
  };
  assignments: Array<{
    target_type: string;
    target_id: number;
    is_exclusion: boolean;
  }>;
  date_created: string;
  date_modified: string;
}

interface ListResponse {
  items: GroupListItem[];
  total: number;
  total_pages: number;
  page: number;
  per_page: number;
}

export default function AddonList() {
  const navigate = useNavigate();
  const store = useWpabStore();
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Bulk Actions State
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await apiFetch({
        path: `optionbay/v1/groups?page=${page}&per_page=20`,
        method: "GET",
      })) as ListResponse;
      setGroups(data.items || []);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch option groups:", err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchGroups();
    // Clear selection when page changes
    setSelectedGroups([]);
  }, [fetchGroups]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGroups(groups.map((g) => g.id));
    } else {
      setSelectedGroups([]);
    }
  };

  const toggleSelectGroup = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedGroups((prev) => [...prev, id]);
    } else {
      setSelectedGroups((prev) => prev.filter((groupId) => groupId !== id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedGroups.length === 0) return;

    const actionText =
      bulkAction === "delete"
        ? __("move to trash", "optionbay")
        : bulkAction === "activate"
        ? __("activate", "optionbay")
        : __("draft", "optionbay");

    if (
      !window.confirm(
        sprintf(
          __("Are you sure you want to %s %d selected items?", "optionbay"),
          actionText,
          selectedGroups.length,
        ),
      )
    ) {
      return;
    }

    try {
      await apiFetch({
        path: `optionbay/v1/groups/bulk`,
        method: "POST",
        data: {
          action: bulkAction,
          ids: selectedGroups,
        },
      });
      setSelectedGroups([]);
      setBulkAction("");
      fetchGroups();
    } catch (err) {
      console.error("Failed to execute bulk action:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        __("Are you sure you want to delete this option group?", "optionbay"),
      )
    ) {
      return;
    }
    try {
      await apiFetch({
        path: `optionbay/v1/groups/${id}`,
        method: "DELETE",
      });
      fetchGroups();
    } catch (err) {
      console.error("Failed to delete group:", err);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await apiFetch({
        path: `optionbay/v1/groups/${id}/duplicate`,
        method: "POST",
      });
      fetchGroups();
    } catch (err) {
      console.error("Failed to duplicate group:", err);
    }
  };

  const getAssignmentSummary = (assignments: GroupListItem["assignments"]) => {
    if (!assignments || assignments.length === 0)
      return __("None", "optionbay");

    const hasGlobal = assignments.some((a) => a.target_type === "global");
    if (hasGlobal) return __("All Products", "optionbay");

    const cats = assignments.filter(
      (a) => a.target_type === "category" && !a.is_exclusion,
    ).length;
    const products = assignments.filter(
      (a) => a.target_type === "product" && !a.is_exclusion,
    ).length;
    const parts: string[] = [];
    if (cats > 0) parts.push(`${cats} ${__("categories", "optionbay")}`);
    if (products > 0) parts.push(`${products} ${__("products", "optionbay")}`);
    return parts.join(", ") || __("None", "optionbay");
  };

  const renderBulkActions = (position: "top" | "bottom") => (
    <div
      className={`alignleft actions bulkactions optionbay-flex optionbay-items-center optionbay-gap-2 ${
        position === "bottom"
          ? "optionbay-mt-4"
          : "optionbay-mt-4 sm:optionbay-mt-0"
      }`}
    >
      <select
        value={position === "bottom" ? "" : bulkAction} // Only bind value to top to prevent double selection issues
        onChange={(e) => setBulkAction(e.target.value)}
        className="optionbay-h-[30px]"
      >
        <option value="">{__("Bulk actions", "optionbay")}</option>
        <option value="activate">{__("Activate", "optionbay")}</option>
        <option value="draft">{__("Draft", "optionbay")}</option>
        <option value="delete">{__("Move to Trash", "optionbay")}</option>
      </select>
      <ClassicButton
        variant="secondary"
        onClick={handleBulkAction}
        disabled={!bulkAction || selectedGroups.length === 0}
      >
        {__("Apply", "optionbay")}
      </ClassicButton>
      {selectedGroups.length > 0 && (
        <span className="optionbay-text-sm optionbay-text-gray-500">
          {sprintf(
            __("%1$d of %2$d selected", "optionbay"),
            selectedGroups.length,
            total,
          )}
        </span>
      )}
    </div>
  );

  const renderPagination = (position: "top" | "bottom") => {
    return (
      <div
        className={`tablenav-pages optionbay-flex optionbay-items-center optionbay-gap-2 ${
          position === "bottom" ? "optionbay-mt-4" : ""
        }`}
      >
        <span className="displaying-num optionbay-text-[13px] optionbay-mr-2">
          {total} {__("items", "optionbay")}
        </span>
        <ClassicButton
          variant="secondary"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          {__("← Previous", "optionbay")}
        </ClassicButton>
        <span className="optionbay-leading-[30px] optionbay-px-2">
          {__("Page", "optionbay")} {page} {__("of", "optionbay")} {totalPages}
        </span>
        <ClassicButton
          variant="secondary"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          {__("Next →", "optionbay")}
        </ClassicButton>
      </div>
    );
  };

  return (
    <div className="optionbay-ignore-preflight">
      {/* Header */}
      <div className="optionbay-flex optionbay-flex-col sm:optionbay-flex-row optionbay-justify-between optionbay-items-start sm:optionbay-items-center optionbay-gap-4 optionbay-mb-4">
        <p className="optionbay-text-gray-600 optionbay-m-0">
          {loading
            ? __("Loading...", "optionbay")
            : `${total} ${__("option groups", "optionbay")}`}
        </p>
        <ClassicButton
          variant="primary"
          onClick={() => navigate("/option-groups/new")}
        >
          {__("Add New Option Group", "optionbay")}
        </ClassicButton>
      </div>

      {/* Top Controls */}
      <div className="optionbay-flex optionbay-justify-between optionbay-flex-wrap optionbay-mb-2">
        {renderBulkActions("top")}
        {renderPagination("top")}
      </div>

      {/* Table */}
      <div className="optionbay-table-responsive">
        <table className="wp-list-table widefat fixed striped">
          <thead>
            <tr>
              <td className="!optionbay-w-[2.2em]">
                <ClassicCheckbox
                  checked={
                    groups.length > 0 && selectedGroups.length === groups.length
                  }
                  onChange={(e) => toggleSelectAll(e)}
                />
              </td>
              <th className="optionbay-w-[40%]">{__("Title", "optionbay")}</th>
              <th>{__("Fields", "optionbay")}</th>
              <th>{__("Assigned To", "optionbay")}</th>
              <th>{__("Status", "optionbay")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="optionbay-text-center optionbay-p-10"
                >
                  {__("Loading option groups...", "optionbay")}
                </td>
              </tr>
            ) : groups.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="optionbay-text-center optionbay-p-10"
                >
                  <p>{__("No option groups found.", "optionbay")}</p>
                  <ClassicButton
                    variant="primary"
                    onClick={() => navigate("/option-groups/new")}
                    className="optionbay-mt-2"
                  >
                    {__("Create your first option group", "optionbay")}
                  </ClassicButton>
                </td>
              </tr>
            ) : (
              groups.map((group) => (
                <tr key={group.id}>
                  <th
                    scope="row"
                    className="optionbay-flex optionbay-justify-start optionbay-mt-[1px]"
                  >
                    <ClassicCheckbox
                      checked={selectedGroups.includes(group.id)}
                      onChange={(e) => toggleSelectGroup(group.id, e)}
                      className="optionbay-mt-0"
                    />
                  </th>
                  <td className="optionbay-group">
                    <a
                      href={`#/option-groups/${group.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/option-groups/${group.id}`);
                      }}
                      className="optionbay-font-semibold optionbay-text-[#2271b1] hover:optionbay-text-[#135e96]"
                    >
                      {group.title || __("(Untitled)", "optionbay")}
                    </a>

                    {/* Hover Actions */}
                    <div className="optionbay-row-actions optionbay-text-[12px] optionbay-flex optionbay-gap-1 optionbay-opacity-0 group-hover:optionbay-opacity-100 optionbay-transition-opacity optionbay-mt-1">
                      <span className="optionbay-text-[#999]">
                        ID: {group.id}
                      </span>
                      <span className="optionbay-text-[#ddd]">|</span>
                      <a
                        className="optionbay-text-[#2271b1] hover:optionbay-underline optionbay-cursor-pointer"
                        href={`#/option-groups/${group.id}`}
                      >
                        {__("Edit", "optionbay")}
                      </a>
                      <span className="optionbay-text-[#ddd]">|</span>
                      <span
                        className="optionbay-text-[#2271b1] hover:optionbay-underline optionbay-cursor-pointer"
                        onClick={() => handleDuplicate(group.id)}
                      >
                        {__("Duplicate", "optionbay")}
                      </span>
                      <span className="optionbay-text-[#ddd]">|</span>
                      <span
                        className="optionbay-text-[#d63638] hover:optionbay-text-[#b32d2e] hover:optionbay-underline optionbay-cursor-pointer"
                        onClick={() => handleDelete(group.id)}
                      >
                        {__("Trash", "optionbay")}
                      </span>
                    </div>
                  </td>
                  <td>{group.field_count}</td>
                  <td>{getAssignmentSummary(group.assignments)}</td>
                  <td>
                    <span
                      className={`optionbay-inline-block optionbay-px-2 optionbay-py-0.5 optionbay-rounded optionbay-text-xs ${
                        group.status === "publish"
                          ? "optionbay-bg-[#dff0d8] optionbay-text-[#3c763d]"
                          : "optionbay-bg-[#f2dede] optionbay-text-[#a94442]"
                      }`}
                    >
                      {group.status === "publish"
                        ? __("Active", "optionbay")
                        : __("Draft", "optionbay")}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Controls */}
      <div className="optionbay-flex optionbay-justify-between optionbay-flex-wrap">
        {renderBulkActions("bottom")}
        {renderPagination("bottom")}
      </div>
    </div>
  );
}
