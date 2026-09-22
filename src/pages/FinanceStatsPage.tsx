import React, { useState, useMemo, useEffect } from 'react';
import type { PigletBatch, InventoryItem, UsedSupplyRecord, FarmExpense } from '../types';
import { Button, Input, Dropdown, toast, useConfirm, Pagination } from '../components/common';
import { formatDateVN } from '../utils';

interface FinanceStatsPageProps {
  pigletBatches: PigletBatch[];
  inventoryItems: InventoryItem[];
  usedSupplies: UsedSupplyRecord[];
  expenses: FarmExpense[];
  onAddExpense: (newExpense: FarmExpense) => void;
  onDeleteExpense?: (id: string) => void;
  onNavigateToYearly?: () => void;
}

export const FinanceStatsPage: React.FC<FinanceStatsPageProps> = ({
  pigletBatches,
  inventoryItems,
  usedSupplies,
  expenses,
  onAddExpense,
  onDeleteExpense,
  onNavigateToYearly
}) => {
  const confirm = useConfirm();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'sales' | 'supplies' | 'expenses'>('overview');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Bộ lọc năm toàn trang (Mặc định năm hiện tại)
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  // Form State: Thêm chi phí phát sinh
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<FarmExpense['category']>('utilities');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseNotes, setExpenseNotes] = useState('');

  // Search & Filter trong Sổ Thu Chi
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Phân trang (Mỗi trang 6 mục nếu danh sách > 6)
  const PAGE_SIZE = 6;
  const [cashFlowPage, setCashFlowPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);
  const [suppliesPage, setSuppliesPage] = useState(1);
  const [expensesPage, setExpensesPage] = useState(1);

  // Reset trang về 1 khi đổi năm hoặc tìm kiếm
  useEffect(() => {
    setCashFlowPage(1);
    setSalesPage(1);
    setSuppliesPage(1);
    setExpensesPage(1);
  }, [selectedYear, searchTerm, transactionTypeFilter]);

  // Format VND
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // 1. TÍNH TOÁN TẤT CẢ DOANH THU BÁN HEO
  const allPigSales = useMemo(() => {
    const list: Array<{
      id: string;
      batchCode: string;
      sowName: string;
      buyerName: string;
      saleDate: string;
      totalSoldPigs: number;
      totalPrice: number;
      saleTypeDescription: string;
    }> = [];

    pigletBatches.forEach((batch) => {
      if (batch.salesHistory && batch.salesHistory.length > 0) {
        batch.salesHistory.forEach((sale) => {
          list.push({
            id: sale.id,
            batchCode: batch.batchCode,
            sowName: batch.sowName || batch.sowRfid,
            buyerName: sale.buyerName,
            saleDate: sale.saleDate,
            totalSoldPigs: sale.totalSoldPigs,
            totalPrice: sale.totalPrice,
            saleTypeDescription:
              sale.saleType === 'pair'
                ? `Bán ${sale.pairCount} cặp (${sale.totalSoldPigs} con)`
                : sale.saleType === 'single'
                ? `Bán lẻ ${sale.singleCount} con`
                : `Bán hết lứa ${sale.totalSoldPigs} con`
          });
        });
      } else if (batch.salePrice && batch.salePrice > 0) {
        list.push({
          id: `sale-batch-${batch.id}`,
          batchCode: batch.batchCode,
          sowName: batch.sowName || batch.sowRfid,
          buyerName: batch.buyerName || 'Thương lái lẻ',
          saleDate: batch.saleDate || batch.weanDate || batch.birthDate,
          totalSoldPigs: batch.soldQuantity || 0,
          totalPrice: batch.salePrice,
          saleTypeDescription: `Xuất bán ${batch.soldQuantity || 0} con`
        });
      }
    });

    return list;
  }, [pigletBatches]);

  // 2. TẬP HỢP CÁC NĂM CÓ DỮ LIỆU
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    allPigSales.forEach((s) => {
      if (s.saleDate && s.saleDate.length >= 4) {
        yearsSet.add(s.saleDate.substring(0, 4));
      }
    });
    usedSupplies.forEach((u) => {
      if (u.usedDate && u.usedDate.length >= 4) {
        yearsSet.add(u.usedDate.substring(0, 4));
      }
    });
    expenses.forEach((e) => {
      if (e.date && e.date.length >= 4) {
        yearsSet.add(e.date.substring(0, 4));
      }
    });
    // Đảm bảo có năm hiện tại
    yearsSet.add(new Date().getFullYear().toString());
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [allPigSales, usedSupplies, expenses]);

  // 3. LỌC DỮ LIỆU THEO NĂM ĐƯỢC CHỌN TRÊN HEADER
  const currentSales = useMemo(() => {
    return selectedYear === 'all'
      ? allPigSales
      : allPigSales.filter((s) => s.saleDate && s.saleDate.startsWith(selectedYear));
  }, [allPigSales, selectedYear]);

  const currentSupplies = useMemo(() => {
    return selectedYear === 'all'
      ? usedSupplies
      : usedSupplies.filter((u) => u.usedDate && u.usedDate.startsWith(selectedYear));
  }, [usedSupplies, selectedYear]);

  const currentExpenses = useMemo(() => {
    return selectedYear === 'all'
      ? expenses
      : expenses.filter((e) => e.date && e.date.startsWith(selectedYear));
  }, [expenses, selectedYear]);

  // 4. CHỈ SỐ TÀI CHÍNH THEO BỘ LỌC NĂM
  const currentPigRevenue = currentSales.reduce((sum, s) => sum + s.totalPrice, 0);
  const currentPigsSold = currentSales.reduce((sum, s) => sum + s.totalSoldPigs, 0);

  const currentSupplyCost = currentSupplies.reduce(
    (sum, u) => sum + (u.totalCost || (u.quantity * (u.unitPrice || 0))),
    0
  );
  const currentExpensesCost = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
  const currentTotalCost = currentSupplyCost + currentExpensesCost;

  const currentNetProfit = currentPigRevenue - currentTotalCost;
  const currentProfitMargin =
    currentPigRevenue > 0 ? ((currentNetProfit / currentPigRevenue) * 100).toFixed(1) : '0';

  // 5. GIÁ TRỊ VỐN TỒN KHO HIỆN TẠI (TÀI SẢN KHO)
  const totalStockValue = inventoryItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  // 6. DÒNG TIỀN TỔNG HỢP (CASH FLOW) THEO NĂM ĐƯỢC CHỌN
  interface CashFlowItem {
    id: string;
    date: string;
    type: 'income' | 'supply_expense' | 'farm_expense';
    title: string;
    categoryLabel: string;
    amount: number;
    partner?: string;
    notes?: string;
  }

  const allCashFlow: CashFlowItem[] = useMemo(() => {
    return [
      ...currentSales.map((s) => ({
        id: `cf-sale-${s.id}`,
        date: s.saleDate,
        type: 'income' as const,
        title: `Bán heo: ${s.sowName} (${s.saleTypeDescription})`,
        categoryLabel: 'Thu Bán Heo',
        amount: s.totalPrice,
        partner: s.buyerName ? `Mối mua: ${s.buyerName}` : undefined,
        notes: `Mã lứa: ${s.batchCode}`
      })),
      ...currentSupplies.map((u) => ({
        id: `cf-sup-${u.id}`,
        date: u.usedDate,
        type: 'supply_expense' as const,
        title: `Dùng vật tư: ${u.name} (${u.quantity} ${u.unit})`,
        categoryLabel:
          u.category === 'medicine'
            ? 'Thuốc & Vắc Xin'
            : u.category === 'feed'
            ? 'Cám & Thức Ăn'
            : 'Vật Tư Chuồng',
        amount: u.totalCost || u.quantity * (u.unitPrice || 0),
        notes: u.notes
      })),
      ...currentExpenses.map((e) => ({
        id: `cf-exp-${e.id}`,
        date: e.date,
        type: 'farm_expense' as const,
        title: e.title,
        categoryLabel:
          e.category === 'utilities'
            ? 'Điện & Nước'
            : e.category === 'labor'
            ? 'Nhân Công'
            : e.category === 'maintenance'
            ? 'Sửa Chữa & Vật Liệu'
            : e.category === 'transport'
            ? 'Vận Chuyển'
            : 'Chi Phí Khác',
        amount: e.amount,
        notes: e.notes
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [currentSales, currentSupplies, currentExpenses]);

  // Filter cash flow
  const filteredCashFlow = allCashFlow.filter((item) => {
    const matchType =
      transactionTypeFilter === 'all'
        ? true
        : transactionTypeFilter === 'income'
        ? item.type === 'income'
        : item.type !== 'income';
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.partner && item.partner.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchType && matchSearch;
  });

  // Dữ liệu phân trang cho 4 tabs (6 mục/trang nếu > 6)
  const paginatedCashFlow = useMemo(() => {
    return filteredCashFlow.slice((cashFlowPage - 1) * PAGE_SIZE, cashFlowPage * PAGE_SIZE);
  }, [filteredCashFlow, cashFlowPage]);

  const paginatedSales = useMemo(() => {
    return currentSales.slice((salesPage - 1) * PAGE_SIZE, salesPage * PAGE_SIZE);
  }, [currentSales, salesPage]);

  const paginatedSupplies = useMemo(() => {
    return currentSupplies.slice((suppliesPage - 1) * PAGE_SIZE, suppliesPage * PAGE_SIZE);
  }, [currentSupplies, suppliesPage]);

  const paginatedExpenses = useMemo(() => {
    return currentExpenses.slice((expensesPage - 1) * PAGE_SIZE, expensesPage * PAGE_SIZE);
  }, [currentExpenses, expensesPage]);

  // Handle Add Expense
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(expenseAmount);
    if (!expenseTitle.trim() || isNaN(amountNum) || amountNum <= 0) {
      toast.warning('Vui lòng nhập tên khoản chi và số tiền hợp lệ.');
      return;
    }

    const newExp: FarmExpense = {
      id: `exp-${Date.now()}`,
      title: expenseTitle.trim(),
      category: expenseCategory,
      amount: amountNum,
      date: expenseDate || new Date().toISOString().split('T')[0],
      notes: expenseNotes.trim() || undefined
    };

    onAddExpense(newExp);
    setShowAddExpenseModal(false);
    setExpenseTitle('');
    setExpenseAmount('');
    setExpenseNotes('');
    toast.success(`Đã thêm khoản chi "${newExp.title}" (${formatVND(newExp.amount)})!`);
  };

  const getExpenseCategoryBadge = (cat: FarmExpense['category']) => {
    switch (cat) {
      case 'utilities':
        return <span className="status-pill" style={{ background: '#fef3c7', color: '#b45309' }}>Điện / Nước</span>;
      case 'labor':
        return <span className="status-pill" style={{ background: '#e0e7ff', color: '#4338ca' }}>Nhân Công</span>;
      case 'maintenance':
        return <span className="status-pill" style={{ background: '#f3e8ff', color: '#7e22ce' }}>Sửa Chữa / Vật Tư</span>;
      case 'transport':
        return <span className="status-pill" style={{ background: '#e0f2fe', color: '#0369a1' }}>Vận Chuyển</span>;
      default:
        return <span className="status-pill" style={{ background: '#f1f5f9', color: '#475569' }}>Chi Phí Khác</span>;
    }
  };

  const isCurrentProfit = currentNetProfit >= 0;

  return (
    <div className="page-container">
      {/* Page Header Banner with Year Selector */}
      <div className="page-header-banner">
        <div>
          <h1 className="custom-title-h2">Thống Kê Thu Chi & Quản Lý Lợi Nhuận</h1>
          <p className="custom-subtitle">
            Hệ thống tự động đồng bộ tiền bán heo, chi phí vật tư đã dùng và các khoản chi phát sinh theo năm.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* BỘ LỌC NĂM TOÀN TRANG */}
          <div style={{ minWidth: '180px' }}>
            <Dropdown
              options={[
                ...availableYears.map((y) => ({
                  label: y === new Date().getFullYear().toString() ? `Năm ${y} (Hiện tại)` : `Năm ${y}`,
                  value: y
                })),
                { label: 'Tất cả các năm', value: 'all' }
              ]}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            />
          </div>

          {/* NÚT THỐNG KÊ THEO NĂM NẰM NGAY CẠNH THÊM CHI PHÍ PHÁT SINH */}
          {onNavigateToYearly && (
            <Button
              type="button"
              variant="outline"
              onClick={onNavigateToYearly}
              style={{
                borderColor: '#93c5fd',
                background: '#eff6ff',
                color: 'var(--primary)',
                fontWeight: 700
              }}
            >
              📊 Thống Kê Theo Năm
            </Button>
          )}

          <Button variant="primary" onClick={() => setShowAddExpenseModal(true)}>
            + Thêm Chi Phí Phát Sinh
          </Button>
        </div>
      </div>

      {/* 4 MAIN KPI CARDS (TỰ ĐỘNG CẬP NHẬT THEO NĂM) */}
      <div className="kpi-stats-grid">
        {/* Card 1: Doanh thu bán heo */}
        <div className="kpi-stat-card kpi-card-income">
          <div className="kpi-stat-header">
            <span className="kpi-stat-title">
              {selectedYear === 'all' ? 'TỔNG THU BÁN HEO' : `THU BÁN HEO NĂM ${selectedYear}`}
            </span>
            <span className="status-pill kpi-stat-pill kpi-pill-income">Thu vào</span>
          </div>
          <div className="kpi-stat-value">
            {formatVND(currentPigRevenue)}
          </div>
          <div className="kpi-stat-sub">
            Xuất bán {currentPigsSold} con ({currentSales.length} đợt bán)
          </div>
        </div>

        {/* Card 2: Tiền vật tư đã dùng */}
        <div className="kpi-stat-card kpi-card-supplies">
          <div className="kpi-stat-header">
            <span className="kpi-stat-title">
              {selectedYear === 'all' ? 'TIỀN VẬT TƯ ĐÃ DÙNG' : `TIỀN VẬT TƯ NĂM ${selectedYear}`}
            </span>
            <span className="status-pill kpi-stat-pill kpi-pill-supplies">Chi phí</span>
          </div>
          <div className="kpi-stat-value">
            {formatVND(currentSupplyCost)}
          </div>
          <div className="kpi-stat-sub">
            {currentSupplies.length} đợt xuất thuốc, vắc xin, cám
          </div>
        </div>

        {/* Card 3: Chi phí phát sinh */}
        <div className="kpi-stat-card kpi-card-expense">
          <div className="kpi-stat-header">
            <span className="kpi-stat-title">
              {selectedYear === 'all' ? 'CHI PHÍ PHÁT SINH' : `CHI PHÍ PHÁT SINH NĂM ${selectedYear}`}
            </span>
            <span className="status-pill kpi-stat-pill kpi-pill-expense">Phát sinh</span>
          </div>
          <div className="kpi-stat-value">
            {formatVND(currentExpensesCost)}
          </div>
          <div className="kpi-stat-sub">
            Điện, nước, nhân công ({currentExpenses.length} khoản)
          </div>
        </div>

        {/* Card 4: Lợi nhuận ròng */}
        <div className={`kpi-stat-card ${isCurrentProfit ? 'kpi-card-profit' : 'kpi-card-loss'}`}>
          <div className="kpi-stat-header">
            <span className="kpi-stat-title">
              {selectedYear === 'all' ? 'LỢI NHUẬN RÒNG' : `LỢI NHUẬN NĂM ${selectedYear}`}
            </span>
            <span className={`status-pill kpi-stat-pill ${isCurrentProfit ? 'kpi-pill-profit' : 'kpi-pill-loss'}`}>
              {isCurrentProfit ? 'LÃI RÒNG' : 'THÂM HỤT'}
            </span>
          </div>
          <div className="kpi-stat-value">
            {isCurrentProfit ? '+' : ''}{formatVND(currentNetProfit)}
          </div>
          <div className="kpi-stat-sub">
            Tỷ suất lợi nhuận: <strong>{currentProfitMargin}%</strong> (Tổng chi: {formatVND(currentTotalCost)})
          </div>
        </div>
      </div>

      {/* Thông tin nhanh phụ: Giá trị tồn kho */}
      <div className="kpi-stats-subbar">
        <div>
          <strong>Vốn hàng tồn kho hiện tại:</strong> <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatVND(totalStockValue)}</span> ({inventoryItems.length} danh mục sẵn có)
        </div>
        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
          * Vốn tồn kho là tài sản lưu động của trại, chi phí chỉ tính khi vật tư thực tế được xuất dùng.
        </div>
      </div>

      {/* SUB TABS NAVIGATION */}
      <div className="sub-tabs-wrapper" style={{ marginBottom: '1.25rem' }}>
        <button
          className={`auth-tab ${activeSubTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('overview')}
        >
          Sổ Thu Chi ({filteredCashFlow.length})
        </button>
        <button
          className={`auth-tab ${activeSubTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('sales')}
        >
          Tiền Bán Heo ({currentSales.length})
        </button>
        <button
          className={`auth-tab ${activeSubTab === 'supplies' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('supplies')}
        >
          Tiền Vật Tư Đã Dùng ({currentSupplies.length})
        </button>
        <button
          className={`auth-tab ${activeSubTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('expenses')}
        >
          Chi Phí Phát Sinh ({currentExpenses.length})
        </button>
      </div>

      {/* SUBTAB 1: SỔ THU CHI TỔNG HỢP (CASH FLOW) */}
      {activeSubTab === 'overview' && (
        <>
          {/* Toolbar filter */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <Input
                placeholder="Tìm giao dịch, nội dung, thương lái..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ width: '220px' }}>
              <Dropdown
                options={[
                  { label: 'Tất cả dòng tiền', value: 'all' },
                  { label: 'Chỉ khoản Thu (Bán heo)', value: 'income' },
                  { label: 'Chỉ khoản Chi (Vật tư + Phát sinh)', value: 'expense' }
                ]}
                value={transactionTypeFilter}
                onChange={(e) => setTransactionTypeFilter(e.target.value as any)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Loại Thu / Chi</th>
                  <th>Nội Dung Giao Dịch</th>
                  <th>Phân Loại</th>
                  <th>Thương Lái / Đối Tác</th>
                  <th>Số Tiền (VNĐ)</th>
                  <th>Ghi Chú</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCashFlow.length > 0 ? (
                  paginatedCashFlow.map((cf) => {
                    const isIncome = cf.type === 'income';
                    return (
                      <tr key={cf.id}>
                        <td><strong>{formatDateVN(cf.date)}</strong></td>
                        <td>
                          {isIncome ? (
                            <span className="status-pill" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                              + Thu Tiền
                            </span>
                          ) : cf.type === 'supply_expense' ? (
                            <span className="status-pill" style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 700 }}>
                              - Chi Vật Tư
                            </span>
                          ) : (
                            <span className="status-pill" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 700 }}>
                              - Chi Phát Sinh
                            </span>
                          )}
                        </td>
                        <td>
                          <strong>{cf.title}</strong>
                        </td>
                        <td>{cf.categoryLabel}</td>
                        <td>
                          {cf.partner ? (
                            <span className="sow-tag-highlight" style={{ fontSize: '0.725rem' }}>
                              {cf.partner}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <strong style={{ fontSize: '0.825rem', color: isIncome ? '#15803d' : '#dc2626' }}>
                            {isIncome ? '+' : '-'} {formatVND(cf.amount)}
                          </strong>
                        </td>
                        <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {cf.notes || '—'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      Không có giao dịch thu chi nào phù hợp {selectedYear !== 'all' ? `trong năm ${selectedYear}` : ''}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={cashFlowPage}
            totalItems={filteredCashFlow.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCashFlowPage}
          />
        </>
      )}

      {/* SUBTAB 2: DOANH THU BÁN HEO */}
      {activeSubTab === 'sales' && (
        <>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ngày Bán</th>
                  <th>Tên Nái Mẹ</th>
                  <th>Mã Lứa</th>
                  <th>Thương Lái / Mối Mua</th>
                  <th>Hình Thức Xuất Bán</th>
                  <th>Số Con Đã Bán</th>
                  <th>Tổng Tiền Thu Về (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSales.length > 0 ? (
                  paginatedSales.map((sale) => (
                    <tr key={sale.id}>
                      <td><strong>{formatDateVN(sale.saleDate)}</strong></td>
                      <td>
                        <span className="sow-tag-highlight" style={{ fontSize: '0.725rem' }}>
                          {sale.sowName}
                        </span>
                      </td>
                      <td><code>{sale.batchCode}</code></td>
                      <td><strong>{sale.buyerName}</strong></td>
                      <td>{sale.saleTypeDescription}</td>
                      <td>
                        <strong style={{ color: '#0369a1' }}>{sale.totalSoldPigs} con</strong>
                      </td>
                      <td>
                        <strong style={{ color: '#15803d', fontSize: '0.825rem' }}>
                          {formatVND(sale.totalPrice)}
                        </strong>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      Chưa có lịch sử bán heo con nào {selectedYear !== 'all' ? `trong năm ${selectedYear}` : ''}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={salesPage}
            totalItems={currentSales.length}
            pageSize={PAGE_SIZE}
            onPageChange={setSalesPage}
          />
        </>
      )}

      {/* SUBTAB 3: CHI PHÍ VẬT TƯ ĐÃ DÙNG */}
      {activeSubTab === 'supplies' && (
        <>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ngày Dùng</th>
                  <th>Tên Vật Tư / Thuốc / Cám</th>
                  <th>Số Lượng</th>
                  <th>Đơn Giá</th>
                  <th>Thành Tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSupplies.length > 0 ? (
                  paginatedSupplies.map((sup) => {
                    const price = sup.unitPrice || 0;
                    const cost = sup.totalCost || (sup.quantity * price);
                    return (
                      <tr key={sup.id}>
                        <td><strong>{formatDateVN(sup.usedDate)}</strong></td>
                        <td><strong>{sup.name}</strong></td>
                        <td>
                          <strong style={{ color: '#0369a1' }}>{sup.quantity} {sup.unit}</strong>
                        </td>
                        <td>{formatVND(price)}</td>
                        <td>
                          <strong style={{ color: '#dc2626' }}>{formatVND(cost)}</strong>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      Chưa có ghi nhận sử dụng vật tư nào {selectedYear !== 'all' ? `trong năm ${selectedYear}` : ''}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={suppliesPage}
            totalItems={currentSupplies.length}
            pageSize={PAGE_SIZE}
            onPageChange={setSuppliesPage}
          />
        </>
      )}

      {/* SUBTAB 4: CHI PHÍ PHÁT SINH */}
      {activeSubTab === 'expenses' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Danh sách các khoản phát sinh ngoài kho: Tiền điện, nước, nhân công, sửa chuồng, vận chuyển...
            </span>
            <Button variant="primary" onClick={() => setShowAddExpenseModal(true)}>
              + Thêm Khoản Chi
            </Button>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ngày Chi</th>
                  <th>Phân Loại</th>
                  <th>Nội Dung Chi Tiết</th>
                  <th>Số Tiền (VNĐ)</th>
                  <th>Ghi Chú</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedExpenses.length > 0 ? (
                  paginatedExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td><strong>{formatDateVN(exp.date)}</strong></td>
                      <td>{getExpenseCategoryBadge(exp.category)}</td>
                      <td><strong>{exp.title}</strong></td>
                      <td>
                        <strong style={{ color: '#dc2626', fontSize: '0.825rem' }}>
                          {formatVND(exp.amount)}
                        </strong>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {exp.notes || '—'}
                      </td>
                      <td>
                        {onDeleteExpense && (
                          <button
                            type="button"
                            onClick={() => {
                              confirm({
                                title: 'Xác Nhận Xóa Khoản Chi',
                                message: `Bạn có chắc chắn muốn xóa khoản chi "${exp.title}" (${formatVND(exp.amount)}) không?`,
                                description: 'Khoản chi này sẽ được gỡ bỏ khỏi bảng thống kê thu chi.',
                                confirmText: 'Xác Nhận Xóa',
                                onConfirm: () => {
                                  onDeleteExpense(exp.id);
                                  toast.success(`Đã xóa khoản chi "${exp.title}"!`);
                                }
                              });
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#dc2626',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          >
                            Xóa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      Chưa có khoản chi phí phát sinh nào {selectedYear !== 'all' ? `trong năm ${selectedYear}` : ''}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={expensesPage}
            totalItems={currentExpenses.length}
            pageSize={PAGE_SIZE}
            onPageChange={setExpensesPage}
          />
        </>
      )}

      {/* MODAL THÊM CHI PHÍ PHÁT SINH */}
      {showAddExpenseModal && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>Thêm Khoản Chi Phí Phát Sinh Mới</h3>
              <button className="close-btn" onClick={() => setShowAddExpenseModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateExpense} className="modal-form">
              <Input
                label="Tên / Nội Dung Khoản Chi"
                placeholder="VD: Tiền điện chuồng trại tháng 9, Mua trấu lót chuồng..."
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Dropdown
                  label="Phân Loại Chi Phí"
                  options={[
                    { label: 'Điện & Nước Chuồng Trại', value: 'utilities' },
                    { label: 'Tiền Công & Nhân Công', value: 'labor' },
                    { label: 'Sửa Chữa & Vật Liệu Chuồng', value: 'maintenance' },
                    { label: 'Cước Vận Chuyển', value: 'transport' },
                    { label: 'Phụ Gia / Thức Ăn Bổ Sung', value: 'feed_additive' },
                    { label: 'Chi Phí Khác', value: 'other' }
                  ]}
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                />
                <Input
                  label="Số Tiền Chi (VNĐ)"
                  type="number"
                  placeholder="VD: 500000"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Ngày Chi"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
              />

              <Input
                label="Ghi Chú Chi Tiết"
                placeholder="VD: Hóa đơn điện tử số #123, mua 20 bao trấu..."
                value={expenseNotes}
                onChange={(e) => setExpenseNotes(e.target.value)}
              />

              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <Button type="button" variant="outline" onClick={() => setShowAddExpenseModal(false)}>
                  Hủy Bỏ
                </Button>
                <Button type="submit" variant="primary">
                  Lưu Khoản Chi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
