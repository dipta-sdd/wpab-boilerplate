import { FC, useState } from "react";
import { __ } from "@wordpress/i18n";
import Button from "../components/common/Button";
import { Input } from "../components/common/Input";
import { NumberInput } from "../components/common/NumberInput";
import { Checkbox } from "../components/common/Checkbox";
import { Radio } from "../components/common/Radio";
import { Switch } from "../components/common/Switch";
import Select from "../components/common/Select";
import MultiSelect from "../components/common/MultiSelect";
import { ListSelect } from "../components/common/ListSelect";
import { Toggler } from "../components/common/Toggler";
import { Tooltip as ToolTip } from "../components/common/ToolTip";
import { Popover } from "../components/common/Popover";
import { useToast } from "../store/toast/use-toast";
import CustomModal from "../components/common/CustomModal";
import { ConfirmationModal } from "../components/common/ConfirmationModal";
import Loader from "../components/common/Loader";
import Skeleton from "../components/common/Skeleton";
import { Stepper } from "../components/common/Stepper";
import { EditableText } from "../components/common/EditableText";
import { CopyToClipboard } from "../components/common/CopyToClipboard";
const Components: FC = () => {
  const toastContext = useToast();
  const toast = toastContext?.toasts || [];
  const addToast = toastContext?.addToast || (() => {});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // States for interactive components
  const [inputValue, setInputValue] = useState("");
  const [numberValue, setNumberValue] = useState(0);
  const [isChecked, setIsChecked] = useState(false);
  const [radioValue, setRadioValue] = useState("option1");
  const [switchState, setSwitchState] = useState(false);
  const [selectValue, setSelectValue] = useState<string | number | null>(null);
  const [multiSelectValues, setMultiSelectValues] = useState<
    (string | number)[]
  >([]);
  const [listSelectValue, setListSelectValue] = useState<string>("item1");
  const [activeTab, setActiveTab] = useState("tab1");
  const [editableText, setEditableText] = useState("Click to edit me");
  const [currentStep, setCurrentStep] = useState(1);

  const selectOptions = [
    { label: "Option 1", value: "opt1" },
    { label: "Option 2", value: "opt2" },
    { label: "Option 3", value: "opt3" },
  ];

  return (
    <div className="wpab-p-[24px]">
      <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[24px] wpab-mb-[24px] wpab-border wpab-border-gray-200">
        <h1 className="wpab-text-[24px] wpab-font-[700] wpab-text-gray-900 wpab-mb-[8px]">
          {__("React Components Showcase", "wpab-boilerplate")}
        </h1>
        <p className="wpab-text-[14px] wpab-text-gray-600 wpab-mb-0">
          {__(
            "A collection of reusable UI components included in the boilerplate.",
            "wpab-boilerplate",
          )}
        </p>
      </div>

      <div className="wpab-grid wpab-grid-cols-1 lg:wpab-grid-cols-2 wpab-gap-[24px]">
        {/* Buttons */}
        <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[20px] wpab-border wpab-border-gray-200">
          <h2 className="wpab-text-[18px] wpab-font-[600] wpab-text-gray-900 wpab-mb-[16px]">
            Buttons
          </h2>
          <div className="wpab-flex wpab-flex-wrap wpab-gap-[12px]">
            <Button color="primary">Primary</Button>
            <Button color="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button color="danger">Danger</Button>
            <Button color="primary">Loading</Button>
            <Button color="primary" disabled>
              Disabled
            </Button>
          </div>
        </div>

        {/* Inputs */}
        <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[20px] wpab-border wpab-border-gray-200">
          <h2 className="wpab-text-[18px] wpab-font-[600] wpab-text-gray-900 wpab-mb-[16px]">
            Inputs
          </h2>
          <div className="wpab-flex wpab-flex-col wpab-gap-[16px]">
            <Input
              label="Standard Input"
              placeholder="Type something..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <NumberInput
              label="Number Input"
              value={numberValue}
              onChange={(val) => setNumberValue(val ?? 0)}
              min={0}
              max={100}
            />
            <EditableText value={editableText} onChange={setEditableText} />
          </div>
        </div>

        {/* Toggles & Checkboxes */}
        <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[20px] wpab-border wpab-border-gray-200">
          <h2 className="wpab-text-[18px] wpab-font-[600] wpab-text-gray-900 wpab-mb-[16px]">
            Selection Controls
          </h2>
          <div className="wpab-flex wpab-flex-col wpab-gap-[16px]">
            <div className="wpab-flex wpab-items-center wpab-gap-[24px]">
              <Checkbox
                label="Checkbox"
                checked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
              />
              <div className="wpab-flex wpab-items-center wpab-gap-[8px]">
                <span className="wpab-text-[13px] wpab-text-gray-900">
                  Toggle Switch
                </span>
                <Switch checked={switchState} onChange={setSwitchState} />
              </div>
            </div>
            <div className="wpab-flex wpab-items-center wpab-gap-[24px]">
              <Radio
                label="Option 1"
                checked={radioValue === "option1"}
                onChange={() => setRadioValue("option1")}
              />
              <Radio
                label="Option 2"
                checked={radioValue === "option2"}
                onChange={() => setRadioValue("option2")}
              />
            </div>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[20px] wpab-border wpab-border-gray-200">
          <h2 className="wpab-text-[18px] wpab-font-[600] wpab-text-gray-900 wpab-mb-[16px]">
            Selects & Dropdowns
          </h2>
          <div className="wpab-flex wpab-flex-col wpab-gap-[16px]">
            <Select
              label="Single Select"
              options={selectOptions}
              value={selectValue}
              onChange={setSelectValue}
              placeholder="Choose an option..."
            />
            <MultiSelect
              label="Multi Select"
              options={selectOptions}
              value={multiSelectValues}
              onChange={setMultiSelectValues}
              placeholder="Choose options..."
            />
            <div>
              <p className="wpab-text-[14px] wpab-font-[600] wpab-text-gray-700 wpab-mb-[8px]">
                List Select
              </p>
              <ListSelect
                items={selectOptions}
                selectedValues={[listSelectValue]}
                onChange={setListSelectValue}
              />
            </div>
          </div>
        </div>

        {/* Feedback & Overlays */}
        <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[20px] wpab-border wpab-border-gray-200">
          <h2 className="wpab-text-[18px] wpab-font-[600] wpab-text-gray-900 wpab-mb-[16px]">
            Feedback & Overlays
          </h2>
          <div className="wpab-flex wpab-flex-wrap wpab-gap-[16px] wpab-items-center">
            <Button
              variant="outline"
              onClick={() =>
                addToast("This is a toast notification.", "success")
              }
            >
              Show Toast
            </Button>

            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              Open Custom Modal
            </Button>

            <Button variant="outline" onClick={() => setIsConfirmOpen(true)}>
              Open Confirm Modal
            </Button>

            <ToolTip content="This is a helpful tooltip!">
              <span className="wpab-text-blue-600 wpab-underline wpab-cursor-help">
                Hover me for Tooltip
              </span>
            </ToolTip>

            <Popover
              trigger={<Button variant="ghost">Click for Popover</Button>}
              content={
                <div className="wpab-p-[12px]">This is popover content.</div>
              }
            />

            <CopyToClipboard text="Text to copy" />
          </div>
        </div>

        {/* Misc & Layout */}
        <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[20px] wpab-border wpab-border-gray-200">
          <h2 className="wpab-text-[18px] wpab-font-[600] wpab-text-gray-900 wpab-mb-[16px]">
            Misc & Layout
          </h2>
          <div className="wpab-flex wpab-flex-col wpab-gap-[24px]">
            <div>
              <p className="wpab-text-[14px] wpab-font-[600] wpab-text-gray-700 wpab-mb-[8px]">
                Toggler (Tabs)
              </p>
              <Toggler
                options={[
                  { value: "tab1", label: "Tab 1" },
                  { value: "tab2", label: "Tab 2" },
                ]}
                value={activeTab}
                onChange={setActiveTab}
              />
            </div>

            <div>
              <p className="wpab-text-[14px] wpab-font-[600] wpab-text-gray-700 wpab-mb-[8px]">
                Stepper
              </p>
              <Stepper
                steps={["Step 1", "Step 2", "Step 3"]}
                currentStep={currentStep}
                setStep={setCurrentStep}
              />
              <div className="wpab-mt-[12px] wpab-flex wpab-gap-[8px]">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                >
                  Next
                </Button>
              </div>
            </div>

            <div>
              <p className="wpab-text-[14px] wpab-font-[600] wpab-text-gray-700 wpab-mb-[8px]">
                Loaders & Skeletons
              </p>
              <div className="wpab-flex wpab-gap-[24px] wpab-items-center">
                <Loader />
                <div className="wpab-flex-1">
                  <Skeleton height="20px" className="wpab-mb-[8px]" />
                  <Skeleton height="20px" width="60%" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Custom Modal Example"
      >
        <div className="wpab-p-[20px]">
          <p>This is a custom modal using the common component.</p>
          <div className="wpab-mt-[20px] wpab-flex wpab-justify-end">
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </div>
        </div>
      </CustomModal>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          addToast("Confirmed!", "success");
          setIsConfirmOpen(false);
        }}
        title="Are you sure?"
        message="This is a confirmation dialogue."
        confirmLabel="Yes, do it"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default Components;
