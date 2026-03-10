import React, { useState } from "react";
import {
  ClassicButton,
  ClassicInput,
  ClassicFormField,
  ClassicOptionsGroup,
  ClassicSelect,
  ClassicCheckbox,
  ClassicTooltip,
  ClassicRepeater,
  ClassicTable,
  ClassicSettingsTable,
  ClassicMultiSelect,
} from "../components/classics";

/* ───── helpers ───── */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="postbox" style={{ marginBottom: 20 }}>
    <h2 className="hndle" style={{ padding: "8px 12px", margin: 0 }}>
      <span>{title}</span>
    </h2>
    <div className="inside">{children}</div>
  </div>
);

/* ───── page ───── */
const ClassicShowcase: React.FC = () => {
  const [checkboxA, setCheckboxA] = useState(false);
  const [checkboxB, setCheckboxB] = useState(true);
  const [selectVal, setSelectVal] = useState<string | number>("option-1");
  const [multiVal, setMultiVal] = useState<(string | number)[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [repeaterItems, setRepeaterItems] = useState([
    { id: "1", title: "Add‑on Group 1" },
    { id: "2", title: "Add‑on Group 2" },
  ]);

  const selectOptions = [
    { value: "option-1", label: "Option 1" },
    { value: "option-2", label: "Option 2" },
    { value: "option-3", label: "Option 3" },
    { value: "option-pro", label: "Pro Feature", variant: "buy_pro" as const },
    { value: "option-soon", label: "Upcoming", variant: "coming_soon" as const },
  ];

  const tableColumns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
  ];

  const tableData = [
    { id: 1, name: "Extra Toppings", status: "Active" },
    { id: 2, name: "Gift Wrapping", status: "Active" },
    { id: 3, name: "Monogram", status: "Inactive" },
  ];

  return (
    <div className="wrap">
      <h1>Classic Components Showcase</h1>
      <p className="description">
        These components use native WordPress &amp; WooCommerce admin CSS
        classes. They look native when rendered inside the WP admin.
      </p>

      {/* ── Buttons ── */}
      <Section title="1. Buttons &amp; Actions">
        <p>
          <ClassicButton variant="primary">Primary Button</ClassicButton>{" "}
          <ClassicButton variant="secondary">Secondary Button</ClassicButton>{" "}
          <ClassicButton variant="link">Link Button</ClassicButton>{" "}
          <ClassicButton variant="link-delete">Delete Link</ClassicButton>{" "}
          <ClassicButton variant="action">WC Action</ClassicButton>
        </p>
        <p>
          <ClassicButton variant="primary" disabled>
            Disabled Primary
          </ClassicButton>{" "}
          <ClassicButton variant="secondary" disabled>
            Disabled Secondary
          </ClassicButton>
        </p>
      </Section>

      {/* ── Inputs ── */}
      <Section title="2. Form Inputs &amp; Sizing">
        <table className="form-table">
          <tbody>
            <tr>
              <th scope="row">Regular Text (25em)</th>
              <td>
                <ClassicInput
                  size="regular"
                  placeholder="regular-text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <th scope="row">Short (WC ~50%)</th>
              <td>
                <ClassicInput
                  size="short"
                  placeholder="short"
                  description="Used for prices, dimensions etc."
                />
              </td>
            </tr>
            <tr>
              <th scope="row">Small Text (50px)</th>
              <td>
                <ClassicInput
                  size="small"
                  type="number"
                  placeholder="0"
                  description="Good for quantities."
                />
              </td>
            </tr>
            <tr>
              <th scope="row">Large Text (100%)</th>
              <td>
                <ClassicInput size="large" placeholder="large-text" />
              </td>
            </tr>
            <tr>
              <th scope="row">WC Price Input</th>
              <td>
                <ClassicInput
                  size="short"
                  inputType="price"
                  placeholder="0.00"
                  description="wc_input_price class applied."
                />
              </td>
            </tr>
            <tr>
              <th scope="row">WC Decimal Input</th>
              <td>
                <ClassicInput
                  size="short"
                  inputType="decimal"
                  placeholder="0.00"
                  description="wc_input_decimal class applied."
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* ── WooCommerce Form Layout ── */}
      <Section title="3. WooCommerce Form Layouts">
        <ClassicOptionsGroup>
          <ClassicFormField label="Option Name">
            <input type="text" className="short" placeholder="e.g. Color" />
          </ClassicFormField>
          <ClassicFormField
            label="Option Price"
            description="The additional cost for this option."
          >
            <input
              type="text"
              className="short wc_input_price"
              placeholder="0.00"
            />
            <ClassicTooltip tip="This price will be added to the product total." />
          </ClassicFormField>
        </ClassicOptionsGroup>

        <ClassicOptionsGroup>
          <ClassicFormField label="Half Width (First)" layout="first">
            <input type="text" className="short" placeholder="First" />
          </ClassicFormField>
          <ClassicFormField label="Half Width (Last)" layout="last">
            <input type="text" className="short" placeholder="Last" />
          </ClassicFormField>
        </ClassicOptionsGroup>
      </Section>

      {/* ── Select ── */}
      <Section title="4. Select Dropdowns">
        <table className="form-table">
          <tbody>
            <tr>
              <th scope="row">Short Select</th>
              <td>
                <ClassicSelect
                  size="short"
                  options={selectOptions}
                  value={selectVal}
                  onChange={(val) => setSelectVal(val)}
                  description="WC short-width select."
                />
              </td>
            </tr>
            <tr>
              <th scope="row">Regular Select</th>
              <td>
                <ClassicSelect
                  size="regular"
                  options={selectOptions}
                  value={selectVal}
                  onChange={(val) => setSelectVal(val)}
                />
              </td>
            </tr>
            <tr>
              <th scope="row">Custom Render</th>
              <td>
                <ClassicSelect
                  size="regular"
                  options={[
                    { value: "red", label: "Red" },
                    { value: "green", label: "Green" },
                    { value: "blue", label: "Blue" },
                  ]}
                  value={selectVal}
                  onChange={(val) => setSelectVal(val)}
                  renderOption={(opt) => (
                    <>
                      <span
                        style={{
                          display: "inline-block",
                          width: 10,
                          height: 10,
                          backgroundColor: opt.value as string,
                          marginRight: 8,
                          borderRadius: "50%",
                        }}
                      />
                      {opt.label}
                    </>
                  )}
                  description="Custom rendering with color dots."
                />
              </td>
            </tr>
            <tr>
              <th scope="row">Searchable Classic Select</th>
              <td>
                <ClassicSelect
                  size="regular"
                  options={selectOptions}
                  value={selectVal}
                  onChange={(val) => setSelectVal(val)}
                  enableSearch={true}
                  description="Dropdown with search and variants."
                />
              </td>
            </tr>
            <tr>
              <th scope="row">MultiSelect Custom</th>
              <td>
                <ClassicMultiSelect
                  options={[
                    { value: "react", label: "React" },
                    { value: "vue", label: "Vue" },
                    { value: "angular", label: "Angular" },
                    { value: "svelte", label: "Svelte Pro", variant: "buy_pro" },
                    { value: "solid", label: "Solid", variant: "coming_soon" },
                  ]}
                  value={multiVal}
                  onChange={(val) => setMultiVal(val)}
                  renderOption={(opt) => (
                    <span style={{ fontWeight: "bold", color: "#3858e9" }}>
                      🚀 {opt.label}
                    </span>
                  )}
                  placeholder="Choose frameworks..."
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* ── Checkboxes ── */}
      <Section title="5. Checkboxes">
        <table className="form-table">
          <tbody>
            <tr>
              <th scope="row">Enable Feature</th>
              <td>
                <ClassicCheckbox
                  label="Turn this feature on"
                  checked={checkboxA}
                  onChange={setCheckboxA}
                  description="This enables the main feature."
                />
              </td>
            </tr>
            <tr>
              <th scope="row">Delete on Uninstall</th>
              <td>
                <ClassicCheckbox
                  label="Remove all data when plugin is deleted"
                  checked={checkboxB}
                  onChange={setCheckboxB}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* ── Tooltips ── */}
      <Section title="6. Tooltips &amp; Icons">
        <p>
          Hover the icon to see the WooCommerce-native tooltip:{" "}
          <ClassicTooltip tip="This is a WooCommerce-style help tooltip using the woocommerce-help-tip class." />
        </p>
        <p>
          Dashicons:{" "}
          <span className="dashicons dashicons-menu" title="Drag handle" />{" "}
          <span className="dashicons dashicons-trash" title="Delete" />{" "}
          <span className="dashicons dashicons-edit" title="Edit" />{" "}
          <span className="dashicons dashicons-visibility" title="View" />
        </p>
      </Section>

      {/* ── Repeater ── */}
      <Section title="7. WooCommerce Repeater UI">
        <ClassicRepeater
          items={repeaterItems}
          onAdd={() =>
            setRepeaterItems((prev) => [
              ...prev,
              {
                id: String(Date.now()),
                title: `Add‑on Group ${prev.length + 1}`,
              },
            ])
          }
          onRemove={(id) =>
            setRepeaterItems((prev) => prev.filter((i) => i.id !== id))
          }
          addLabel="Add Add‑on Group"
          renderItem={(item) => (
            <table className="form-table" style={{ margin: 0 }}>
              <tbody>
                <tr>
                  <th scope="row">Name</th>
                  <td>
                    <input
                      type="text"
                      className="regular-text"
                      defaultValue={item.title}
                    />
                  </td>
                </tr>
                <tr>
                  <th scope="row">Type</th>
                  <td>
                    <ClassicSelect
                      size="short"
                      options={[
                        { value: "checkbox", label: "Checkbox" },
                        { value: "radio", label: "Radio Button" },
                        { value: "select", label: "Dropdown" },
                        { value: "text", label: "Text Input" },
                      ]}
                      value="select"
                      onChange={() => {}}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        />
      </Section>

      {/* ── Table ── */}
      <Section title="8. WP List Table">
        <ClassicTable
          columns={tableColumns}
          data={tableData}
          keyField="id"
          renderCell={(item: any, key: any) => {
            if (key === "status") {
              return (
                <span
                  style={{
                    color: item.status === "Active" ? "green" : "#999",
                  }}
                >
                  {item.status}
                </span>
              );
            }
            return String(item[key as keyof typeof item]);
          }}
        />
      </Section>

      {/* ── Settings Table ── */}
      <Section title="9. Settings Table (form-table)">
        <ClassicSettingsTable
          fields={[
            {
              label: "Site Title",
              render: () => (
                <ClassicInput
                  size="regular"
                  placeholder="My WordPress Site"
                />
              ),
            },
            {
              label: "Tagline",
              render: () => (
                <ClassicInput
                  size="regular"
                  placeholder="Just another WordPress site"
                  description="In a few words, explain what this site is about."
                />
              ),
            },
            {
              label: "Currency",
              render: () => (
                <ClassicSelect
                  size="short"
                  options={[
                    { value: "USD", label: "US Dollar ($)" },
                    { value: "EUR", label: "Euro (€)" },
                    { value: "GBP", label: "Pound Sterling (£)" },
                  ]}
                  value="USD"
                  onChange={() => {}}
                />
              ),
            },
            {
              label: "Enable Logging",
              render: () => (
                <ClassicCheckbox
                  label="Log debug information"
                  checked={checkboxA}
                  onChange={setCheckboxA}
                />
              ),
            },
          ]}
        />
        <p className="submit">
          <ClassicButton variant="primary">Save Changes</ClassicButton>
        </p>
      </Section>
    </div>
  );
};

export default ClassicShowcase;
