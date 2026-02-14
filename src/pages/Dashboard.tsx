import { FC } from "react";
import { __ } from "@wordpress/i18n";
import { useWpabStore } from "../store/wpabStore";

const Dashboard: FC = () => {
  const store = useWpabStore();

  return (
    <div className="wpab-p-[24px]">
      {/* Welcome Banner */}
      <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[24px] wpab-mb-[24px] wpab-border wpab-border-gray-200">
        <h1 className="wpab-text-[24px] wpab-font-[700] wpab-text-gray-900 wpab-mb-[8px]">
          {__("Welcome to", "wpab-boilerplate")}{" "}
          {store.pluginData?.plugin_name || "WPAB Boilerplate"}
        </h1>
        <p className="wpab-text-[14px] wpab-text-gray-600 wpab-mb-0">
          {__(
            "Your plugin is ready. Start building something amazing!",
            "wpab-boilerplate",
          )}
        </p>
        <p className="wpab-text-[12px] wpab-text-gray-400 wpab-mt-[4px]">
          {__("Version", "wpab-boilerplate")}: {store.version}
        </p>
      </div>

      {/* Info Cards Grid */}
      <div className="wpab-grid wpab-grid-cols-1 md:wpab-grid-cols-3 wpab-gap-[16px]">
        {/* Card 1 */}
        <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[20px] wpab-border wpab-border-gray-200">
          <div className="wpab-flex wpab-items-center wpab-gap-[12px] wpab-mb-[12px]">
            <div className="wpab-w-[40px] wpab-h-[40px] wpab-bg-blue-100 wpab-rounded-[8px] wpab-flex wpab-items-center wpab-justify-center">
              <span className="wpab-text-[20px]">📄</span>
            </div>
            <h3 className="wpab-text-[16px] wpab-font-[600] wpab-text-gray-900">
              {__("REST API", "wpab-boilerplate")}
            </h3>
          </div>
          <p className="wpab-text-[13px] wpab-text-gray-600">
            {__(
              "A sample REST API controller is included. See app/Api/SampleController.php for the pattern.",
              "wpab-boilerplate",
            )}
          </p>
        </div>

        {/* Card 2 */}
        <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[20px] wpab-border wpab-border-gray-200">
          <div className="wpab-flex wpab-items-center wpab-gap-[12px] wpab-mb-[12px]">
            <div className="wpab-w-[40px] wpab-h-[40px] wpab-bg-green-100 wpab-rounded-[8px] wpab-flex wpab-items-center wpab-justify-center">
              <span className="wpab-text-[20px]">⚛️</span>
            </div>
            <h3 className="wpab-text-[16px] wpab-font-[600] wpab-text-gray-900">
              {__("React Components", "wpab-boilerplate")}
            </h3>
          </div>
          <p className="wpab-text-[13px] wpab-text-gray-600">
            {__(
              "Pre-built UI components: Button, Input, Select, Modal, Toast, and more in src/components/common/.",
              "wpab-boilerplate",
            )}
          </p>
        </div>

        {/* Card 3 */}
        <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[20px] wpab-border wpab-border-gray-200">
          <div className="wpab-flex wpab-items-center wpab-gap-[12px] wpab-mb-[12px]">
            <div className="wpab-w-[40px] wpab-h-[40px] wpab-bg-purple-100 wpab-rounded-[8px] wpab-flex wpab-items-center wpab-justify-center">
              <span className="wpab-text-[20px]">🗃️</span>
            </div>
            <h3 className="wpab-text-[16px] wpab-font-[600] wpab-text-gray-900">
              {__("Database", "wpab-boilerplate")}
            </h3>
          </div>
          <p className="wpab-text-[13px] wpab-text-gray-600">
            {__(
              "Custom table creation on activation via app/Data/DbManager.php. Includes example items & logs tables.",
              "wpab-boilerplate",
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
