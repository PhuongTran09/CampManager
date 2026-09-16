import React from 'react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Logo */}
        <div className="header-brand" onClick={() => onTabChange('sows')}>
          <div className="brand-text">
            <span className="brand-title">PigFarm Pro</span>
            <span className="brand-tagline">Quản Lý Trang Trại Heo</span>
          </div>
        </div>

        {/* Header Navigation */}
        <nav className="header-nav">
          <button
            className={`nav-item ${activeTab === 'sows' ? 'active' : ''}`}
            onClick={() => onTabChange('sows')}
          >
            Quản Lý Heo Nái
          </button>
        </nav>
      </div>
    </header>
  );
};
