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
import { CardRadioGroup } from "../components/common/CardRadioGroup";

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
  const [listSelectValue, setListSelectValue] = useState<string>("opt1");
  const [activeTab, setActiveTab] = useState("tab1");
  const [editableText, setEditableText] = useState("Click to edit me");
  const [currentStep, setCurrentStep] = useState(1);
  const [cardValue, setCardValue] = useState("card1");

  const selectOptions = [
    { label: "Option 1", value: "opt1" },
    { label: "Option 2", value: "opt2" },
    { label: "Option 3", value: "opt3" },
    { label: "Pro Option", value: "pro", variant: "buy_pro" as const },
    { label: "Coming Soon", value: "soon", variant: "coming_soon" as const },
  ];

  const cardOptions = [
    {
      value: "card1",
      title: "Standard Feature",
      description: "This is a standard feature card.",
    },
    {
      value: "card2",
      title: "Pro Feature",
      description: "Upgrade to unlock this premium feature.",
      variant: "buy_pro" as const,
    },
    {
      value: "card3",
      title: "Coming Soon",
      description: "We are working hard on this one.",
      variant: "coming_soon" as const,
    },
  ];

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[24px] wpab-border wpab-border-gray-200 wpab-shadow-sm">
      <h2 className="wpab-text-[18px] wpab-font-[700] wpab-text-gray-900 wpab-mb-[20px] wpab-border-b wpab-pb-2">
        {title}
      </h2>
      <div className="wpab-space-y-[24px]">{children}</div>
    </div>
  );

  const Subsection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div>
      <h3 className="wpab-text-[14px] wpab-font-[600] wpab-text-gray-500 wpab-mb-[12px] wpab-uppercase wpab-tracking-wider">
        {title}
      </h3>
      <div className="wpab-flex wpab-flex-wrap wpab-gap-[12px] wpab-items-center">
        {children}
      </div>
    </div>
  );

  return (
    <div className="wpab-p-[24px]  wpab-space-y-[32px]">
      <div className="wpab-bg-white wpab-rounded-[12px] wpab-p-[32px] wpab-border wpab-border-gray-200 wpab-shadow-sm">
        <h1 className="wpab-text-[28px] wpab-font-[800] wpab-text-gray-900 wpab-mb-[8px]">
          {__("Components Showcase", "optionbay")}
        </h1>
        <p className="wpab-text-[15px] wpab-text-gray-600">
          {__(
            "Every variant, color, and size available in our common component library.",
            "optionbay",
          )}
        </p>
      </div>

      <div className="wpab-grid wpab-grid-cols-1 wpab-gap-[32px]">
        {/* BUTTONS */}
        <Section title="Buttons">
          <Subsection title="Colors & Variants">
            <div className="wpab-grid wpab-grid-cols-3 wpab-gap-4 wpab-w-full">
              <Button color="primary">Solid Primary</Button>
              <Button color="primary" variant="outline">
                Outline Primary
              </Button>
              <Button color="primary" variant="ghost">
                Ghost Primary
              </Button>

              <Button color="secondary">Solid Secondary</Button>
              <Button color="secondary" variant="outline">
                Outline Secondary
              </Button>
              <Button color="secondary" variant="ghost">
                Ghost Secondary
              </Button>

              <Button color="danger">Solid Danger</Button>
              <Button color="danger" variant="outline">
                Outline Danger
              </Button>
              <Button color="danger" variant="ghost">
                Ghost Danger
              </Button>
            </div>
          </Subsection>
          <Subsection title="Sizes">
            <Button size="small">Small Button</Button>
            <Button size="medium">Medium Button</Button>
            <Button size="large">Large Button</Button>
          </Subsection>
          <Subsection title="States">
            <Button disabled>Disabled Button</Button>
            <Button>Regular Button</Button>
          </Subsection>
        </Section>

        {/* INPUTS */}
        <Section title="Inputs">
          <div className="wpab-grid wpab-grid-cols-1 md:wpab-grid-cols-2 wpab-gap-8">
            <div className="wpab-space-y-6">
              <Subsection title="Input Sizes">
                <Input
                  label="Small Input"
                  size="small"
                  placeholder="small..."
                />
                <Input
                  label="Medium Input"
                  size="medium"
                  placeholder="medium..."
                />
                <Input
                  label="Large Input"
                  size="large"
                  placeholder="large..."
                />
              </Subsection>
              <Subsection title="Input States">
                <Input label="Disabled" disabled value="Cannot type here" />
                <Input
                  label="Error State"
                  error="This field is required"
                  placeholder="Error demonstration..."
                />
              </Subsection>
            </div>
            <div className="wpab-space-y-6">
              <Subsection title="Number Input Sizes">
                <NumberInput
                  label="Small"
                  value={numberValue}
                  onChange={(v) => setNumberValue(v ?? 0)}
                />
                <NumberInput
                  label="Medium"
                  value={numberValue}
                  onChange={(v) => setNumberValue(v ?? 0)}
                />
                <NumberInput
                  label="Large"
                  value={numberValue}
                  onChange={(v) => setNumberValue(v ?? 0)}
                />
              </Subsection>
              <Subsection title="Number Input States">
                <NumberInput
                  label="Disabled"
                  disabled
                  value={10}
                  onChange={() => {}}
                />
                <NumberInput
                  label="Error"
                  error="Invalid number"
                  value={-5}
                  onChange={(v) => setNumberValue(v ?? 0)}
                />
              </Subsection>
            </div>
          </div>
          <Subsection title="Interactive Editable Text">
            <EditableText value={editableText} onChange={setEditableText} />
          </Subsection>
        </Section>

        {/* SELECTION CONTROLS */}
        <Section title="Selection Controls">
          <div className="wpab-grid wpab-grid-cols-1 md:wpab-grid-cols-3 wpab-gap-8">
            <Subsection title="Checkboxes">
              <Checkbox label="Unchecked" checked={false} onChange={() => {}} />
              <Checkbox label="Checked" checked={true} onChange={() => {}} />
              <Checkbox
                label="Disabled"
                checked={false}
                disabled
                onChange={() => {}}
              />
              <Checkbox
                label="Interactive"
                checked={isChecked}
                onChange={setIsChecked}
              />
            </Subsection>
            <Subsection title="Radios">
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
              <Radio
                label="Disabled"
                checked={false}
                disabled
                onChange={() => {}}
              />
            </Subsection>
            <Subsection title="Switches">
              <div className="wpab-space-y-4 wpab-w-full">
                <div className="wpab-flex wpab-gap-4">
                  <Switch
                    size="small"
                    checked={switchState}
                    onChange={setSwitchState}
                  />
                  <Switch
                    size="medium"
                    checked={switchState}
                    onChange={setSwitchState}
                  />
                  <Switch
                    size="large"
                    checked={switchState}
                    onChange={setSwitchState}
                  />
                </div>
                <div className="wpab-flex wpab-gap-4">
                  <Switch checked={false} onChange={() => {}} />
                  <Switch checked={true} onChange={() => {}} />
                  <Switch checked={false} disabled onChange={() => {}} />
                </div>
              </div>
            </Subsection>
          </div>
        </Section>

        {/* SELECTS */}
        <Section title="Selects & Dropdowns">
          <div className="wpab-grid wpab-grid-cols-1 md:wpab-grid-cols-2 wpab-gap-8">
            <Subsection title="Select Variants">
              <Select
                label="Single Select"
                options={selectOptions}
                value={selectValue}
                onChange={setSelectValue}
              />
              <Select
                label="With Search"
                options={selectOptions}
                value={selectValue}
                onChange={setSelectValue}
                enableSearch
              />
              <Select
                label="Compact"
                options={selectOptions}
                value={selectValue}
                onChange={setSelectValue}
                isCompact
              />
            </Subsection>
            <Subsection title="MultiSelect Variants">
              <MultiSelect
                label="Multi Select"
                options={selectOptions}
                value={multiSelectValues}
                onChange={setMultiSelectValues}
              />
              <MultiSelect
                label="No Search"
                options={selectOptions}
                value={multiSelectValues}
                onChange={setMultiSelectValues}
                enableSearch={false}
              />
              <MultiSelect
                label="Compact"
                options={selectOptions}
                value={multiSelectValues}
                onChange={setMultiSelectValues}
                isCompact
              />
            </Subsection>
          </div>
          <Subsection title="List Select Sizes">
            <div className="wpab-grid wpab-grid-cols-1 md:wpab-grid-cols-3 wpab-gap-4 wpab-w-full">
              <ListSelect
                size="small"
                items={selectOptions}
                selectedValues={[listSelectValue]}
                onChange={setListSelectValue}
              />
              <ListSelect
                size="medium"
                items={selectOptions}
                selectedValues={[listSelectValue]}
                onChange={setListSelectValue}
              />
              <ListSelect
                size="large"
                items={selectOptions}
                selectedValues={[listSelectValue]}
                onChange={setListSelectValue}
              />
            </div>
          </Subsection>
        </Section>

        {/* FEEDBACK & OVERLAYS */}
        <Section title="Feedback & Overlays">
          <Subsection title="Toasts">
            <Button
              color="primary"
              onClick={() => addToast("Successfully saved changes!", "success")}
            >
              Success Toast
            </Button>
            <Button
              color="danger"
              onClick={() => addToast("Failed to update settings.", "error")}
            >
              Error Toast
            </Button>
            <Button
              color="secondary"
              onClick={() => addToast("New update available.")}
            >
              Default Toast
            </Button>
          </Subsection>
          <Subsection title="Modals">
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              Open Custom Modal
            </Button>
            <Button
              variant="outline"
              color="danger"
              onClick={() => setIsConfirmOpen(true)}
            >
              Open Confirmation
            </Button>
          </Subsection>
          <Subsection title="Tooltips (Positions)">
            <ToolTip content="Tooltip on Top" position="top">
              <Button size="small">Top</Button>
            </ToolTip>
            <ToolTip content="Tooltip on Bottom" position="bottom">
              <Button size="small">Bottom</Button>
            </ToolTip>
            <ToolTip content="Tooltip on Left" position="left">
              <Button size="small">Left</Button>
            </ToolTip>
            <ToolTip content="Tooltip on Right" position="right">
              <Button size="small">Right</Button>
            </ToolTip>
          </Subsection>
          <Subsection title="Popovers">
            <Popover
              align="bottom-left"
              trigger={
                <Button variant="ghost" size="small">
                  Bottom Left
                </Button>
              }
              content={
                <div className="wpab-p-4">Content aligned bottom-left</div>
              }
            />
            <Popover
              align="top-right"
              trigger={
                <Button variant="ghost" size="small">
                  Top Right
                </Button>
              }
              content={
                <div className="wpab-p-4">Content aligned top-right</div>
              }
            />
          </Subsection>
        </Section>

        {/* CARD RADIO GROUP */}
        <Section title="Card Radio Groups">
          <Subsection title="Responsive Grid Layout">
            <CardRadioGroup
              layout="responsive"
              options={cardOptions}
              value={cardValue}
              onChange={setCardValue}
            />
          </Subsection>
          <Subsection title="Horizontal Layout">
            <CardRadioGroup
              layout="horizontal"
              options={cardOptions}
              value={cardValue}
              onChange={setCardValue}
            />
          </Subsection>
        </Section>

        {/* MISC & LAYOUT */}
        <Section title="Misc & Layout">
          <div className="wpab-grid wpab-grid-cols-1 md:wpab-grid-cols-2 wpab-gap-12">
            <div className="wpab-space-y-8">
              <Subsection title="Toggler Sizes">
                <Toggler
                  size="small"
                  options={[
                    { label: "A", value: "a" },
                    { label: "B", value: "b" },
                  ]}
                  value={"a"}
                  onChange={() => {}}
                />
                <Toggler
                  size="medium"
                  options={[
                    { label: "Tab 1", value: "1" },
                    { label: "Tab 2", value: "2" },
                  ]}
                  value={"1"}
                  onChange={() => {}}
                />
                <Toggler
                  size="large"
                  options={[
                    { label: "Option 1", value: "o1" },
                    { label: "Option 2", value: "o2" },
                  ]}
                  value={"o1"}
                  onChange={() => {}}
                />
              </Subsection>
              <Subsection title="Full Width Toggler">
                <Toggler
                  fullWidth
                  options={[
                    { label: "Yes", value: "y" },
                    { label: "No", value: "n" },
                  ]}
                  value={"y"}
                  onChange={() => {}}
                />
              </Subsection>
            </div>
            <div className="wpab-space-y-8">
              <Subsection title="Stepper Progress">
                <Stepper
                  steps={["Identity", "Payment", "Confirm"]}
                  currentStep={currentStep}
                  setStep={setCurrentStep}
                />
                <div className="wpab-flex wpab-gap-2">
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                  >
                    Next
                  </Button>
                </div>
              </Subsection>
              <Subsection title="Loading States">
                <div className="wpab-flex wpab-items-center wpab-gap-4">
                  <Loader />
                  <div className="wpab-w-32 wpab-space-y-2">
                    <Skeleton height="12px" />
                    <Skeleton height="12px" width="70%" />
                  </div>
                </div>
              </Subsection>
            </div>
          </div>
          <Subsection title="Utility">
            <CopyToClipboard text="optionbay-token-123" />
          </Subsection>
        </Section>
      </div>

      {/* MODALS */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Component Demo Modal"
      >
        <div className="wpab-space-y-4">
          <p>
            This is the standard custom modal component. It supports custom
            headers, footers, and content scrolling.
          </p>
          <Input label="Test input in modal" placeholder="Type here..." />
        </div>
      </CustomModal>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Confirm Action"
        message="Are you sure you want to proceed? This expanded showcase is quite large now."
        onConfirm={() => {
          addToast("Confirmed expansion!", "success");
          setIsConfirmOpen(false);
        }}
        onCancel={() => setIsConfirmOpen(false)}
        confirmLabel="Yes, Expand"
        cancelLabel="No, Wait"
      />
    </div>
  );
};

export default Components;
