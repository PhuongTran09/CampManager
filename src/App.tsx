import { useState } from 'react';
import type { Sow, PigletBatch, InventoryItem, UsedSupplyRecord, FarmExpense } from './types';
import { MOCK_SOWS, MOCK_PIGLET_BATCHES, MOCK_INVENTORY_ITEMS, MOCK_USED_SUPPLIES, MOCK_FARM_EXPENSES } from './constants/mockData';
import { Header } from './components/layout';
import { ToastProvider, ConfirmProvider } from './components/common';
import { AuthPage, SowProfilePage, PigletsPage, InventoryPage, FinanceStatsPage, YearlyStatsPage } from './pages';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('sows');

  // Pig Farm Data State
  const [sows, setSows] = useState<Sow[]>(MOCK_SOWS);
  const [pigletBatches, setPigletBatches] = useState<PigletBatch[]>(MOCK_PIGLET_BATCHES);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(MOCK_INVENTORY_ITEMS);
  const [usedSupplies, setUsedSupplies] = useState<UsedSupplyRecord[]>(MOCK_USED_SUPPLIES);
  const [expenses, setExpenses] = useState<FarmExpense[]>(MOCK_FARM_EXPENSES);

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
          <div onClick={handleLoginSuccess}>
            <AuthPage />
          </div>
        </ConfirmProvider>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <ConfirmProvider>
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
                onNavigateToYearly={() => setActiveTab('yearly')}
              />
            )}

            {activeTab === 'yearly' && (
              <YearlyStatsPage
                pigletBatches={pigletBatches}
                inventoryItems={inventoryItems}
                usedSupplies={usedSupplies}
                expenses={expenses}
                onBack={() => setActiveTab('finances')}
              />
            )}
          </main>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
