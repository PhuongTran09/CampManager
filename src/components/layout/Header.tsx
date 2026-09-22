import React, { useState } from 'react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabClick = (tab: string) => {
    onTabChange(tab);
    setIsMenuOpen(false);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Logo */}
        <div className="header-brand" onClick={() => handleTabClick('sows')}>
          <div className="brand-text">
            <span className="brand-title">PigFamily</span>
            <span className="brand-tagline">Quản lý trại heo của bạn</span>
          </div>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <svg
            className="menu-icon"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>

        {/* Header Navigation */}
        <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
          <button
            className={`nav-item ${activeTab === 'sows' ? 'active' : ''}`}
            onClick={() => handleTabClick('sows')}
          >
            Quản Lý Heo Nái
          </button>
          <button
            className={`nav-item ${activeTab === 'piglets' ? 'active' : ''}`}
            onClick={() => handleTabClick('piglets')}
          >
            Quản Lý Lứa Heo Con
          </button>
          <button
            className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => handleTabClick('inventory')}
          >
            Quản Lý Kho & Vật Tư
          </button>
          <button
            className={`nav-item ${activeTab === 'finances' || activeTab === 'yearly' ? 'active' : ''}`}
            onClick={() => handleTabClick('finances')}
          >
            Thống Kê Thu Chi
          </button>
        </nav>
      </div>
    </header>
  );
};

