import React from 'react';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

export const Dropdown: React.FC<DropdownProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className="custom-input-group">
      {label && <label className="custom-label">{label}</label>}
      <div className="custom-dropdown-container">
        <select className={`custom-select ${className}`} {...props}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="custom-dropdown-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </div>
    </div>
  );
};
