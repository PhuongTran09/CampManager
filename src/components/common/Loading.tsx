import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import pigLoadingSvg from '../../assets/icon/pigloading.svg';

export interface PigLoadingProps {
  size?: 'sm' | 'md' | 'lg' | number;
  text?: string;
  subtext?: string;
  fullScreen?: boolean;
  centered?: boolean;
  inline?: boolean;
  showDots?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const PigLoading: React.FC<PigLoadingProps> = ({
  size = 'md',
  text = 'Đang tải dữ liệu...',
  subtext,
  fullScreen = false,
  centered = false,
  inline = false,
  showDots = true,
  className = '',
  style
}) => {
  useEffect(() => {
    if (fullScreen) {
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
      return () => {
        if (!document.querySelector('.modal-overlay')) {
          document.body.classList.remove('modal-open');
          document.documentElement.classList.remove('modal-open');
        }
      };
    }
  }, [fullScreen]);
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 52
      : size === 'lg'
      ? 110
      : 80;

  const cleanText = text ? text.replace(/\.+$/, '').trim() : '';

  const content = (
    <div
      className={`pig-loading-container ${inline ? 'pig-loading-inline' : ''} ${className}`}
      style={style}
    >
      <div className="pig-loading-avatar-wrap">
        <div
          className="pig-loading-halo"
          style={{ width: pixelSize * 1.15, height: pixelSize * 1.15 }}
        />
        <img
          src={pigLoadingSvg}
          alt="Đang tải dữ liệu heo trại..."
          className="pig-loading-img"
          style={{ width: pixelSize, height: pixelSize }}
          loading="eager"
        />
        <div
          className="pig-loading-shadow"
          style={{ width: pixelSize * 0.75, height: Math.max(6, pixelSize * 0.12) }}
        />
      </div>

      {cleanText && (
        <div className="pig-loading-text">
          <span>{cleanText}</span>
        </div>
      )}

      {subtext && <div className="pig-loading-subtext">{subtext}</div>}

      <div className="pig-loading-bar" style={{ width: Math.max(120, pixelSize * 1.6) }}>
        <div className="pig-loading-bar-inner" />
      </div>

      {/* Dấu ... nằm dưới thanh chạy */}
      {showDots && (
        <div className="pig-loading-dots-bottom" aria-hidden="true">
          <span className="pig-loading-dot">.</span>
          <span className="pig-loading-dot">.</span>
          <span className="pig-loading-dot">.</span>
        </div>
      )}
    </div>
  );

  if (fullScreen || centered) {
    return (
      <div
        className={`pig-loading-fullscreen ${centered && !fullScreen ? 'pig-loading-transparent-bg' : ''}`}
        role="status"
        aria-live="polite"
      >
        <div className="pig-loading-card">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// ==========================================================================
// Loading Context & Hook for Global/App-wide Control
// ==========================================================================

interface LoadingContextType {
  isLoading: boolean;
  loadingText: string;
  showLoading: (text?: string, subtext?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(action: () => Promise<T> | T, text?: string, minDurationMs?: number) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Đang tải dữ liệu...');
  const [loadingSubtext, setLoadingSubtext] = useState<string | undefined>(undefined);

  const showLoading = useCallback((text = 'Đang tải dữ liệu...', subtext?: string) => {
    setLoadingText(text);
    setLoadingSubtext(subtext);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingSubtext(undefined);
  }, []);

  const withLoading = useCallback(
    async <T,>(action: () => Promise<T> | T, text = 'Đang tải dữ liệu...', minDurationMs = 450): Promise<T> => {
      showLoading(text);
      const start = Date.now();
      try {
        const result = await action();
        const elapsed = Date.now() - start;
        if (elapsed < minDurationMs) {
          await new Promise((resolve) => setTimeout(resolve, minDurationMs - elapsed));
        }
        return result;
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  // Lock body scroll while global loading is visible
  useEffect(() => {
    if (isLoading) {
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
    } else {
      // Only remove if no modal-overlay exists
      if (!document.querySelector('.modal-overlay')) {
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
      }
    }
  }, [isLoading]);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingText,
        showLoading,
        hideLoading,
        withLoading
      }}
    >
      {children}
      {isLoading && (
        <PigLoading
          fullScreen
          text={loadingText}
          subtext={loadingSubtext}
        />
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
