import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { __ } from "@wordpress/i18n";
import { ClassicButton } from "../components/classics";
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
  }, [fetchGroups]);

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

  return (
    <div className="optionbay-ignore-preflight">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <p className="optionbay-text-gray-600" style={{ margin: 0 }}>
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

      {/* Table */}
      <table className="wp-list-table widefat fixed striped">
        <thead>
          <tr>
            <th style={{ width: "30%" }}>{__("Title", "optionbay")}</th>
            <th>{__("Fields", "optionbay")}</th>
            <th>{__("Assigned To", "optionbay")}</th>
            <th>{__("Status", "optionbay")}</th>
            <th style={{ width: "15%" }}>{__("Actions", "optionbay")}</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "40px" }}>
                {__("Loading option groups...", "optionbay")}
              </td>
            </tr>
          ) : groups.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "40px" }}>
                <p>{__("No option groups found.", "optionbay")}</p>
                <ClassicButton
                  variant="primary"
                  onClick={() => navigate("/option-groups/new")}
                  style={{ marginTop: "8px" }}
                >
                  {__("Create your first option group", "optionbay")}
                </ClassicButton>
              </td>
            </tr>
          ) : (
            groups.map((group) => (
              <tr key={group.id}>
                <td>
                  <a
                    href={`#/option-groups/${group.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/option-groups/${group.id}`);
                    }}
                    style={{ fontWeight: 600 }}
                  >
                    {group.title || __("(Untitled)", "optionbay")}
                  </a>
                </td>
                <td>{group.field_count}</td>
                <td>{getAssignmentSummary(group.assignments)}</td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "3px",
                      fontSize: "12px",
                      backgroundColor:
                        group.status === "publish" ? "#dff0d8" : "#f2dede",
                      color: group.status === "publish" ? "#3c763d" : "#a94442",
                    }}
                  >
                    {group.status === "publish"
                      ? __("Active", "optionbay")
                      : __("Draft", "optionbay")}
                  </span>
                </td>
                <td>
                  <ClassicButton
                    variant="secondary"
                    onClick={() => navigate(`/option-groups/${group.id}`)}
                    style={{ marginRight: "4px" }}
                  >
                    {__("Edit", "optionbay")}
                  </ClassicButton>
                  <ClassicButton
                    variant="link"
                    onClick={() => handleDelete(group.id)}
                    style={{ color: "#b32d2e" }}
                  >
                    {__("Delete", "optionbay")}
                  </ClassicButton>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="tablenav bottom"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            marginTop: "16px",
          }}
        >
          <ClassicButton
            variant="secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            {__("← Previous", "optionbay")}
          </ClassicButton>
          <span style={{ lineHeight: "30px" }}>
            {__("Page", "optionbay")} {page} / {totalPages}
          </span>
          <ClassicButton
            variant="secondary"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            {__("Next →", "optionbay")}
          </ClassicButton>
        </div>
      )}
    </div>
  );
}
