import { useState, useEffect } from "react";
import apiFetch from "@wordpress/api-fetch";

const Logs = () => {
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch<{ content: string }>({
        path: "/wpab-boilerplate/v1/logs",
      });
      setLogs(response.content || "No logs found.");
    } catch (err: any) {
      setError(err.message || "Failed to fetch logs.");
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!confirm("Are you sure you want to clear the logs?")) return;

    try {
      await apiFetch({ path: "/wpab-boilerplate/v1/logs", method: "DELETE" });
      setLogs("No logs found.");
    } catch (err: any) {
      alert(err.message || "Failed to clear logs.");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="wpab-p-6">
      <div className="wpab-flex wpab-justify-between wpab-items-center wpab-mb-6">
        <div>
          <h1 className="wpab-text-2xl wpab-font-bold wpab-text-gray-900">
            Debug Logs
          </h1>
          <p className="wpab-text-sm wpab-text-gray-500 wpab-mt-1">
            View logs stored in
            /wp-content/uploads/wpab-boilerplate-logs/debug.log
          </p>
        </div>
        <div className="wpab-flex wpab-gap-2">
          <button
            onClick={fetchLogs}
            className="wpab-px-4 wpab-py-2 wpab-bg-white wpab-border wpab-border-gray-300 wpab-rounded-md wpab-text-sm wpab-font-medium wpab-text-gray-700 hover:wpab-bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={clearLogs}
            className="wpab-px-4 wpab-py-2 wpab-bg-red-600 wpab-text-white wpab-rounded-md wpab-text-sm wpab-font-medium hover:wpab-bg-red-700"
          >
            Clear Logs
          </button>
        </div>
      </div>

      {error && (
        <div className="wpab-bg-red-50 wpab-border wpab-border-red-200 wpab-text-red-700 wpab-px-4 wpab-py-3 wpab-rounded wpab-mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="wpab-flex wpab-justify-center wpab-py-12">
          <span className="wpab-loading-spinner"></span>
        </div>
      ) : (
        <div className="wpab-bg-gray-900 wpab-rounded-lg wpab-overflow-hidden wpab-shadow-sm">
          <div className="wpab-p-4 wpab-bg-gray-800 wpab-border-b wpab-border-gray-700 wpab-flex wpab-justify-between wpab-items-center">
            <span className="wpab-text-xs wpab-text-gray-400 wpab-font-mono">
              debug.log
            </span>
          </div>
          <pre className="wpab-p-4 wpab-text-gray-300 wpab-font-mono wpab-text-xs wpab-overflow-x-auto wpab-max-h-[600px] wpab-whitespace-pre-wrap">
            {logs}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Logs;
