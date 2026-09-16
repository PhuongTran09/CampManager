import { useState } from 'react';
import type { Sow } from './types';
import { MOCK_SOWS } from './constants/mockData';
import { Header } from './components/layout';
import { AuthPage, SowProfilePage } from './pages';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('sows');

  // Pig Farm Data State
  const [sows, setSows] = useState<Sow[]>(MOCK_SOWS);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Sow state handlers
  const handleAddSow = (newSow: Sow) => {
    setSows([newSow, ...sows]);
  };

  const handleUpdateSow = (updatedSow: Sow) => {
    setSows(sows.map((s) => (s.id === updatedSow.id ? updatedSow : s)));
  };

  // If not logged in, show Auth Page
  if (!isAuthenticated) {
    return (
      <div onClick={handleLoginSuccess}>
        <AuthPage />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* App Header & Navigation Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Pages */}
      <main>
        {activeTab === 'sows' && (
          <SowProfilePage
            sows={sows}
            onAddSow={handleAddSow}
            onUpdateSow={handleUpdateSow}
          />
        )}
      </main>
    </div>
  );
}

export default App;
