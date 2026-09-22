import React, { useState, useRef, useEffect } from 'react';
import { formatDateVN } from '../../utils';

export interface DatePickerProps {
  label?: string;
  value?: string; // Expect YYYY-MM-DD or DD/MM/YYYY
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  name?: string;
  error?: string;
  required?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value = '',
  onChange,
  name,
  error,
  required,
  style,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value to year, month, day
  const getInitialDate = () => {
    if (!value) return new Date();
    if (value.includes('/')) {
      const parts = value.split('/');
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const [currentMonth, setCurrentMonth] = useState(getInitialDate());

  useEffect(() => {
    if (value) {
      setCurrentMonth(getInitialDate());
    }
  }, [value]);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedDisplay = value ? formatDateVN(value) : '';

  const handleSelectDay = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    
    // Store internally as YYYY-MM-DD
    const dateStr = `${year}-${month}-${dayStr}`;
    
    if (onChange) {
      onChange({ target: { name, value: dateStr } });
    }
    setIsOpen(false);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Calendar math
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  return (
    <div className="custom-input-group" ref={containerRef} style={style}>
      {label && <label className="custom-label">{label} {required && '*'}</label>}
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Custom Input Trigger */}
        <div
          className={`custom-datepicker-trigger ${className} ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={formattedDisplay ? 'date-val' : 'date-placeholder'}>
            {formattedDisplay || 'dd/mm/yyyy'}
          </span>
          <svg className="calendar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>

        {/* Custom Beautiful Calendar Popover */}
        {isOpen && (
          <div className="custom-calendar-popover animate-fade-in">
            {/* Header: Month & Year Nav */}
            <div className="popover-header">
              <button type="button" className="nav-btn" onClick={handlePrevMonth}>‹</button>
              <div className="month-year-title">
                Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
              </div>
              <button type="button" className="nav-btn" onClick={handleNextMonth}>›</button>
            </div>

            {/* Weekdays */}
            <div className="popover-weekdays">
              <span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
            </div>

            {/* Days Grid */}
            <div className="popover-days-grid">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="day-cell empty"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const year = currentMonth.getFullYear();
                const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
                const dayStr = String(day).padStart(2, '0');
                const thisDateStr = `${year}-${month}-${dayStr}`;
                const isSelected = value === thisDateStr || formattedDisplay === `${dayStr}/${month}/${year}`;

                return (
                  <button
                    key={day}
                    type="button"
                    className={`day-cell ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectDay(day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {error && (
        <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
};
