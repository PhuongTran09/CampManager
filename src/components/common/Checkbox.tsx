import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isSwitch?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, isSwitch = false, className = '', ...props }) => {
  if (isSwitch) {
    return (
      <label className="custom-checkbox-wrapper">
        <div className="custom-switch">
          <input type="checkbox" className="custom-switch-input" {...props} />
          <span className="custom-switch-slider"></span>
        </div>
        <span className="custom-checkbox-label">{label}</span>
      </label>
    );
  }

  return (
    <label className="custom-checkbox-wrapper">
      <input type="checkbox" className="custom-checkbox-input" {...props} />
      <div className="custom-checkbox-box">
        <svg viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <span className="custom-checkbox-label">{label}</span>
    </label>
  );
};
