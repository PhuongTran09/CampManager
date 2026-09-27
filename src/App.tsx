import { useState, useEffect } from 'react';
import type { Sow, PigletBatch, InventoryItem, UsedSupplyRecord, FarmExpense } from './types';
import { MOCK_SOWS, MOCK_PIGLET_BATCHES, MOCK_INVENTORY_ITEMS, MOCK_USED_SUPPLIES, MOCK_FARM_EXPENSES } from './constants/mockData';
import { Header } from './components/layout';
import { ToastProvider, ConfirmProvider, LoadingProvider, PigLoading } from './components/common';
import { AuthPage, SowProfilePage, PigletsPage, InventoryPage, FinanceStatsPage, YearlyStatsPage } from './pages';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('sows');

  // Khóa cuộn trang chính khi có bất kỳ modal/popup nào đang mở
  useEffect(() => {
    const updateModalScrollLock = () => {
      const hasModal = document.querySelector('.modal-overlay') !== null;
      if (hasModal) {
        document.body.classList.add('modal-open');
        document.documentElement.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
      }
    };

    updateModalScrollLock();
    const observer = new MutationObserver(updateModalScrollLock);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    };
  }, []);

  // Pig Farm Data State
  const [sows, setSows] = useState<Sow[]>(MOCK_SOWS);
  const [pigletBatches, setPigletBatches] = useState<PigletBatch[]>(MOCK_PIGLET_BATCHES);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(MOCK_INVENTORY_ITEMS);
  const [usedSupplies, setUsedSupplies] = useState<UsedSupplyRecord[]>(MOCK_USED_SUPPLIES);
  const [expenses, setExpenses] = useState<FarmExpense[]>(MOCK_FARM_EXPENSES);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [tabLoadingText, setTabLoadingText] = useState('Đang tải dữ liệu...');

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    const tabTexts: Record<string, string> = {
      sows: 'Đang tải hồ sơ đàn heo nái',
      piglets: 'Đang tải dữ liệu heo con theo mẹ & tách bầy',
      inventory: 'Đang đồng bộ dữ liệu kho cám & thuốc',
      finances: 'Đang tổng hợp báo cáo tài chính & doanh thu',
      yearly: 'Đang kết xuất thống kê doanh thu năm'
    };
    setTabLoadingText(tabTexts[tab] || 'Đang tải dữ liệu');
    setIsTabLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTabLoading(false);
    }, 380);
  };

  const handleLoginSuccess = () => {
    setIsTabLoading(true);
    setTabLoadingText('Đang tải dữ liệu trang trại');
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsTabLoading(false);
    }, 450);
  };

  // Sow state handlers
  const handleAddSow = (newSow: Sow) => {
    setSows([newSow, ...sows]);
  };

  const handleUpdateSow = (updatedSow: Sow) => {
    setSows(sows.map((s) => (s.id === updatedSow.id ? updatedSow : s)));
  };

  // Piglet batch handlers
  const handleAddPigletBatch = (newBatch: PigletBatch) => {
    setPigletBatches([newBatch, ...pigletBatches]);
  };

  const handleUpdatePigletBatch = (updatedBatch: PigletBatch) => {
    setPigletBatches(pigletBatches.map((b) => (b.id === updatedBatch.id ? updatedBatch : b)));
  };

  // Inventory handlers
  const handleAddInventoryItem = (newItem: InventoryItem) => {
    setInventoryItems([newItem, ...inventoryItems]);
  };

  const handleUpdateInventoryItem = (updatedItem: InventoryItem) => {
    setInventoryItems(inventoryItems.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };

  const handleDeleteInventoryItem = (itemId: string) => {
    setInventoryItems(inventoryItems.filter((i) => i.id !== itemId));
  };

  // Used supplies handlers
  const handleAddUsedSupply = (record: UsedSupplyRecord) => {
    setUsedSupplies([record, ...usedSupplies]);
  };

  const handleDeleteUsedSupply = (recordId: string) => {
    setUsedSupplies(usedSupplies.filter((r) => r.id !== recordId));
  };

  // Farm expenses handler
  const handleAddExpense = (newExpense: FarmExpense) => {
    setExpenses([newExpense, ...expenses]);
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(expenses.filter((e) => e.id !== expenseId));
  };

  // If not logged in, show Auth Page
  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <ConfirmProvider>
          <LoadingProvider>
            {isTabLoading && (
              <PigLoading
                fullScreen
                size="md"
                text={tabLoadingText}
                subtext="Hệ thống đang chuẩn bị số liệu mới nhất..."
              />
            )}
            <div onClick={handleLoginSuccess}>
              <AuthPage />
            </div>
          </LoadingProvider>
        </ConfirmProvider>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <ConfirmProvider>
        <LoadingProvider>
          <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            {/* Centered Fullscreen Pig Loading */}
            {isTabLoading && (
              <PigLoading
                fullScreen
                size="md"
                text={tabLoadingText}
                subtext="Hệ thống đang đồng bộ dữ liệu quản lý..."
              />
            )}

            {/* App Header & Navigation Bar */}
            <Header
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />

            {/* Main Content Pages */}
            <main>
              {activeTab === 'sows' && (
                <SowProfilePage
                  sows={sows}
                  onAddSow={handleAddSow}
                  onUpdateSow={handleUpdateSow}
                  onAddPigletBatch={handleAddPigletBatch}
                />
              )}

              {activeTab === 'piglets' && (
                <PigletsPage
                  batches={pigletBatches}
                  onUpdateBatch={handleUpdatePigletBatch}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryPage
                  items={inventoryItems}
                  usedSupplies={usedSupplies}
                  onAddItem={handleAddInventoryItem}
                  onUpdateItem={handleUpdateInventoryItem}
                  onDeleteItem={handleDeleteInventoryItem}
                  onAddUsedSupply={handleAddUsedSupply}
                  onDeleteUsedSupply={handleDeleteUsedSupply}
                />
              )}

              {activeTab === 'finances' && (
                <FinanceStatsPage
                  pigletBatches={pigletBatches}
                  inventoryItems={inventoryItems}
                  usedSupplies={usedSupplies}
                  expenses={expenses}
                  onAddExpense={handleAddExpense}
                  onDeleteExpense={handleDeleteExpense}
                  onNavigateToYearly={() => handleTabChange('yearly')}
                />
              )}

              {activeTab === 'yearly' && (
                <YearlyStatsPage
                  pigletBatches={pigletBatches}
                  inventoryItems={inventoryItems}
                  usedSupplies={usedSupplies}
                  expenses={expenses}
                  onBack={() => handleTabChange('finances')}
                />
              )}
            </main>
          </div>
        </LoadingProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
