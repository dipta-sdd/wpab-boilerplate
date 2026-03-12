import React, { useState, useEffect } from "react";
    import {
  ClassicSettingsTable,
  ClassicInput,
  ClassicCheckbox,
  ClassicButton,
} from "../components/classics";
import { useToast } from "../store/toast/use-toast";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";

interface SettingsData {
  global_enableFeature: boolean;
  global_exampleText: string;
  advanced_deleteAllOnUninstall: boolean;
  debug_enableMode: boolean;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response: any = await apiFetch({
        path: "wpab-boilerplate/v1/settings",
      });
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      addToast(__("Failed to load settings.", "wpab-boilerplate"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const response: any = await apiFetch({
        path: "wpab-boilerplate/v1/settings",
        method: "POST",
        data: settings,
      });
      if (response.success) {
        setSettings(response.data);
        addToast(__("Settings saved successfully.", "wpab-boilerplate"), "success");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      addToast(__("Failed to save settings.", "wpab-boilerplate"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="wpab-p-page-default">
        <p>{__("Loading settings...", "wpab-boilerplate")}</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="wpab-p-page-default">
        <p>{__("Failed to load settings.", "wpab-boilerplate")}</p>
      </div>
    );
  }

  return (
    <div className="wpab-p-page-default wpab-ignore-preflight">
      <ClassicSettingsTable
        title={__("Global Settings", "wpab-boilerplate")}
        description={__(
          "Configure the main functionality of your plugin.",
          "wpab-boilerplate"
        )}
        fields={[
          {
            id: "global_enableFeature",
            label: __("Enable Core Feature", "wpab-boilerplate"),
            tooltip: __("Toggle the main functionality of the plugin.", "wpab-boilerplate"),
            render: () => (
              <ClassicCheckbox
                checked={settings.global_enableFeature}
                onChange={(val) =>
                  setSettings({ ...settings, global_enableFeature: val })
                }
                label={__("Enable the amazing feature", "wpab-boilerplate")}
                description={__(
                  "When enabled, the plugin will perform its core magic.",
                  "wpab-boilerplate"
                )}
              />
            ),
          },
          {
            id: "global_exampleText",
            label: __("Welcome Message", "wpab-boilerplate"),
            tooltip: __("The text shown on the dashboard.", "wpab-boilerplate"),
            render: () => (
              <ClassicInput
                value={settings.global_exampleText}
                onChange={(e) =>
                  setSettings({ ...settings, global_exampleText: e.target.value })
                }
                description={__(
                  "Enter a custom welcome message for your users.",
                  "wpab-boilerplate"
                )}
                size="regular"
              />
            ),
          },
        ]}
      />

      <ClassicSettingsTable
        title={__("Advanced Settings", "wpab-boilerplate")}
        description={__(
          "Careful! These settings affect data persistence and debugging.",
          "wpab-boilerplate"
        )}
        fields={[
          {
            id: "debug_enableMode",
            label: __("Debug Mode", "wpab-boilerplate"),
            render: () => (
              <ClassicCheckbox
                checked={settings.debug_enableMode}
                onChange={(val) =>
                  setSettings({ ...settings, debug_enableMode: val })
                }
                label={__("Enable developer logging", "wpab-boilerplate")}
                description={__(
                  "Detailed logs will be written to the database for troubleshooting.",
                  "wpab-boilerplate"
                )}
              />
            ),
          },
          {
            id: "advanced_deleteAllOnUninstall",
            label: __("Delete Data on Uninstall", "wpab-boilerplate"),
            render: () => (
              <ClassicCheckbox
                checked={settings.advanced_deleteAllOnUninstall}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    advanced_deleteAllOnUninstall: val,
                  })
                }
                label={__("Purge all plugin data", "wpab-boilerplate")}
                description={__(
                  "WARNING: Checking this will delete all plugin tables and settings when the plugin is deleted.",
                  "wpab-boilerplate"
                )}
              />
            ),
          },
        ]}
      />

      <div className="wpab-mt-8">
        <ClassicButton
          variant="primary"
          onClick={handleSave}
          loading={isSaving}
          disabled={isSaving}
        >
          {__("Save Changes", "wpab-boilerplate")}
        </ClassicButton>
      </div>
    </div>
  );
};

export default Settings;
