import { useState, useEffect } from "react";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";

const Logs = () => {
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch<{ content: string }>({
        path: "/optionbay/v1/logs",
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
      await apiFetch({ path: "/optionbay/v1/logs", method: "DELETE" });
      setLogs("No logs found.");
    } catch (err: any) {
      alert(err.message || "Failed to clear logs.");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="">
      <div className="optionbay-flex optionbay-justify-between optionbay-items-end optionbay-mb-6">
        <div>
          <p className="optionbay-text-sm optionbay-text-gray-500">
            {__(
              "View logs stored in /wp-content/uploads/optionbay-logs/",
              "optionbay",
            )}
          </p>
        </div>
        <div className="optionbay-flex optionbay-gap-2">
          <button
            onClick={fetchLogs}
            className="optionbay-px-4 optionbay-py-2 optionbay-bg-white optionbay-border optionbay-border-gray-300 optionbay-rounded-md optionbay-text-sm optionbay-font-medium optionbay-text-gray-700 hover:optionbay-bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={clearLogs}
            className="optionbay-px-4 optionbay-py-2 optionbay-bg-red-600 optionbay-text-white optionbay-rounded-md optionbay-text-sm optionbay-font-medium hover:optionbay-bg-red-700"
          >
            Clear Logs
          </button>
        </div>
      </div>

      {error && (
        <div className="optionbay-bg-red-50 optionbay-border optionbay-border-red-200 optionbay-text-red-700 optionbay-px-4 optionbay-py-3 optionbay-rounded optionbay-mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="optionbay-flex optionbay-justify-center optionbay-py-12">
          <span className="optionbay-loading-spinner"></span>
        </div>
      ) : (
        <div className="optionbay-bg-gray-900 optionbay-rounded-lg optionbay-overflow-hidden optionbay-shadow-sm">
          <div className="optionbay-p-4 optionbay-bg-gray-800 optionbay-border-b optionbay-border-gray-700 optionbay-flex optionbay-justify-between optionbay-items-center">
            <span className="optionbay-text-xs optionbay-text-gray-400 optionbay-font-mono">
              debug.log
            </span>
          </div>
          <pre className="optionbay-p-4 optionbay-text-gray-300 optionbay-font-mono optionbay-text-xs optionbay-overflow-x-auto optionbay-max-h-[600px] optionbay-whitespace-pre-wrap">
            {logs}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Logs;
