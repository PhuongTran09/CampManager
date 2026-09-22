import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="custom-input-group">
      {label && <label className="custom-label">{label}</label>}
      <input className={`custom-input ${className}`} {...props} />
      {error && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '2px' }}>{error}</span>}
    </div>
  );
};

