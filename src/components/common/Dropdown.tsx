import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface DropdownProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  value?: string | number;
  placeholder?: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options = [],
  value,
  onChange,
  disabled,
  name,
  className = '',
  placeholder = 'Chọn một mục...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Xác định option đang được chọn
  const selectedOption =
    options.find((opt) => String(opt.value) === String(value)) ||
    (value === undefined ? options[0] : undefined);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optVal: string | number) => {
    if (disabled) return;
    if (onChange) {
      onChange({
        target: {
          value: String(optVal),
          name
        }
      });
    }
    setIsOpen(false);
  };

  return (
    <div className="custom-input-group">
      {label && <label className="custom-label">{label}</label>}
      <div className="custom-dropdown-container" ref={containerRef}>
        {/* Hidden select để tương thích hoàn toàn với native form nếu cần */}
        <select
          name={name}
          value={value !== undefined ? value : options[0]?.value}
          onChange={() => {}}
          tabIndex={-1}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
          aria-hidden="true"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Khung Trigger hiển thị (chiều cao chuẩn 38px bằng custom-btn) */}
        <div
          className={`custom-select-trigger ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''} ${className}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              !disabled && setIsOpen(!isOpen);
            } else if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
        >
          <span className="custom-select-value">{displayLabel}</span>
          <span className={`custom-dropdown-icon ${isOpen ? 'open' : ''}`}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>

        {/* Danh sách lựa chọn Custom Popover thay thế option mặc định */}
        {isOpen && (
          <div className="custom-dropdown-menu">
            {options.map((opt) => {
              const isSelected = selectedOption && String(opt.value) === String(selectedOption.value);
              return (
                <div
                  key={opt.value}
                  className={`custom-dropdown-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="dropdown-item-label">{opt.label}</span>
                  {isSelected && (
                    <svg
                      className="dropdown-item-check"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
