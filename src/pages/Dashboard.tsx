import { FC } from "react";
import { __ } from "@wordpress/i18n";
import { useWpabStore } from "../store/wpabStore";

const Dashboard: FC = () => {
  const store = useWpabStore();

  return (
    <div className="">
      {/* Welcome Banner */}
      <div className="optionbay-bg-white optionbay-rounded-[12px] optionbay-p-[24px] optionbay-mb-[24px] optionbay-border optionbay-border-gray-200">
        <p className="optionbay-text-[15px] optionbay-text-gray-600 optionbay-mb-2">
          {__(
            "Your plugin is ready. Start building something amazing with our dual modern and classic components!",
            "optionbay",
          )}
        </p>
        <p className="optionbay-text-[12px] optionbay-text-gray-400">
          {__("Version", "optionbay")}: {store.version}
        </p>
      </div>

      {/* Info Cards Grid */}
      <div className="optionbay-grid optionbay-grid-cols-1 md:optionbay-grid-cols-3 optionbay-gap-[16px]">
        {/* Card 1 */}
        <div className="optionbay-bg-white optionbay-rounded-[12px] optionbay-p-[20px] optionbay-border optionbay-border-gray-200">
          <div className="optionbay-flex optionbay-items-center optionbay-gap-[12px] optionbay-mb-[12px]">
            <div className="optionbay-w-[40px] optionbay-h-[40px] optionbay-bg-blue-100 optionbay-rounded-[8px] optionbay-flex optionbay-items-center optionbay-justify-center">
              <span className="optionbay-text-[20px]">📄</span>
            </div>
            <h3 className="optionbay-text-[16px] optionbay-font-[600] optionbay-text-gray-900">
              {__("REST API", "optionbay")}
            </h3>
          </div>
          <p className="optionbay-text-[13px] optionbay-text-gray-600">
            {__(
              "A REST API controller is included. See app/Api/SettingsController.php for the pattern.",
              "optionbay",
            )}
          </p>
        </div>

        {/* Card 2 */}
        <div className="optionbay-bg-white optionbay-rounded-[12px] optionbay-p-[20px] optionbay-border optionbay-border-gray-200">
          <div className="optionbay-flex optionbay-items-center optionbay-gap-[12px] optionbay-mb-[12px]">
            <div className="optionbay-w-[40px] optionbay-h-[40px] optionbay-bg-green-100 optionbay-rounded-[8px] optionbay-flex optionbay-items-center optionbay-justify-center">
              <span className="optionbay-text-[20px]">⚛️</span>
            </div>
            <h3 className="optionbay-text-[16px] optionbay-font-[600] optionbay-text-gray-900">
              {__("React Components", "optionbay")}
            </h3>
          </div>
          <p className="optionbay-text-[13px] optionbay-text-gray-600">
            {__(
              "Pre-built UI components: Button, Input, Select, Modal, Toast, and more in src/components/common/.",
              "optionbay",
            )}
          </p>
        </div>

        {/* Card 3 */}
        <div className="optionbay-bg-white optionbay-rounded-[12px] optionbay-p-[20px] optionbay-border optionbay-border-gray-200">
          <div className="optionbay-flex optionbay-items-center optionbay-gap-[12px] optionbay-mb-[12px]">
            <div className="optionbay-w-[40px] optionbay-h-[40px] optionbay-bg-purple-100 optionbay-rounded-[8px] optionbay-flex optionbay-items-center optionbay-justify-center">
              <span className="optionbay-text-[20px]">🗃️</span>
            </div>
            <h3 className="optionbay-text-[16px] optionbay-font-[600] optionbay-text-gray-900">
              {__("Database", "optionbay")}
            </h3>
          </div>
          <p className="optionbay-text-[13px] optionbay-text-gray-600">
            {__(
              "Custom table creation on activation via app/Data/DbManager.php. Includes example items & logs tables.",
              "optionbay",
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
