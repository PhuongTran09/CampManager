import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
  }, []);

  const handleClose = useCallback(() => {
    if (options?.onCancel) {
      options.onCancel();
    }
    setOptions(null);
  }, [options]);

  const handleConfirm = useCallback(() => {
    const cb = options?.onConfirm;
    setOptions(null);
    if (cb) {
      cb();
    }
  }, [options]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && options) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, handleClose]);

  const isWarning = options?.variant === 'warning';

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <div
          className="modal-overlay"
          onClick={handleClose}
          style={{
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)'
          }}
        >
          <div
            className="modal-card animate-fade-in"
            style={{
              maxWidth: '430px',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: isWarning ? '#fef3c7' : '#fee2e2',
                  color: isWarning ? '#b45309' : '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  flexShrink: 0
                }}
              >
                !
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: '0 0 0.4rem 0',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--text-main, #0f172a)'
                  }}
                >
                  {options.title || 'Xác Nhận Xóa'}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: '#334155',
                    lineHeight: 1.5,
                    fontWeight: 500
                  }}
                >
                  {options.message}
                </p>
                <p
                  style={{
                    margin: '0.4rem 0 0 0',
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    lineHeight: 1.4
                  }}
                >
                  {options.description || 'Hành động này sẽ xóa dữ liệu và không thể hoàn tác.'}
                </p>
              </div>
            </div>

            <div className="confirm-modal-actions">
              <button
                type="button"
                className="confirm-btn-cancel"
                onClick={handleClose}
              >
                {options.cancelText || 'Hủy Bỏ'}
              </button>
              <button
                type="button"
                className={`confirm-btn-confirm ${isWarning ? 'confirm-btn-warning' : 'confirm-btn-danger'}`}
                onClick={handleConfirm}
              >
                {options.confirmText || 'Xác Nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context.confirm;
};
