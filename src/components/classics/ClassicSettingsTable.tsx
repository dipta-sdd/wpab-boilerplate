import React from "react";

interface SettingsField {
  label: string;
  render: () => React.ReactNode;
}

interface ClassicSettingsTableProps {
  fields: SettingsField[];
  className?: string;
}

/**
 * WordPress settings page layout using `form-table`.
 * Labels on the left, inputs on the right — like WooCommerce > Settings.
 */
export const ClassicSettingsTable: React.FC<ClassicSettingsTableProps> = ({
  fields,
  className = "",
}) => {
  return (
    <table className={`form-table ${className}`}>
      <tbody>
        {fields.map((field, index) => (
          <tr key={index}>
            <th scope="row">{field.label}</th>
            <td>{field.render()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
