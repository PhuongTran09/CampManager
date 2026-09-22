import React, { useState, useMemo, useEffect } from 'react';
import type { PigletBatch, InventoryItem, UsedSupplyRecord, FarmExpense } from '../types';
import { Input, Dropdown, Pagination } from '../components/common';
import { formatDateVN } from '../utils';

const PAGE_SIZE = 6;

interface YearlyStatsPageProps {
  pigletBatches: PigletBatch[];
  inventoryItems: InventoryItem[];
  usedSupplies: UsedSupplyRecord[];
  expenses: FarmExpense[];
  onBack?: () => void;
}

export const YearlyStatsPage: React.FC<YearlyStatsPageProps> = ({
  pigletBatches,
  inventoryItems,
  usedSupplies,
  expenses,
  onBack
}) => {
  // 1. TẬP HỢP TẤT CẢ DOANH THU BÁN HEO TRONG LỊCH SỬ
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
      unitPriceStr?: string;
    }> = [];

    pigletBatches.forEach((batch) => {
      if (batch.salesHistory && batch.salesHistory.length > 0) {
        batch.salesHistory.forEach((sale) => {
          let unitPriceStr = '—';
          if (sale.saleType === 'pair' && sale.pricePerPair) {
            unitPriceStr = `${new Intl.NumberFormat('vi-VN').format(sale.pricePerPair)} đ/cặp`;
          } else if (sale.pricePerPig) {
            unitPriceStr = `${new Intl.NumberFormat('vi-VN').format(sale.pricePerPig)} đ/con`;
          }

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
                : `Bán hết lứa ${sale.totalSoldPigs} con`,
            unitPriceStr
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
          saleTypeDescription: `Xuất bán ${batch.soldQuantity || 0} con`,
          unitPriceStr:
            batch.soldQuantity && batch.soldQuantity > 0
              ? `${new Intl.NumberFormat('vi-VN').format(Math.round(batch.salePrice / batch.soldQuantity))} đ/con`
              : '—'
        });
      }
    });

    return list.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  }, [pigletBatches]);

  // 2. TẬP HỢP TẤT CẢ NĂM CÓ DỮ LIỆU
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
    // Thêm năm hiện tại
    yearsSet.add(new Date().getFullYear().toString());
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [allPigSales, usedSupplies, expenses]);

  // State bộ lọc năm chính: mặc định năm hiện tại
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  // Năm đích để xem bảng chi tiết 12 tháng (mặc định năm mới nhất)
  const [drilldownYear, setDrilldownYear] = useState<string>(
    availableYears[0] || new Date().getFullYear().toString()
  );

  // Tab con trong khu vực tra cứu lịch sử chi tiết
  const [historyTab, setHistoryTab] = useState<'sales' | 'supplies' | 'expenses' | 'cashflow'>('sales');
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [cashflowTypeFilter, setCashflowTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Pagination States (6 items per page)
  const [salesPage, setSalesPage] = useState(1);
  const [suppliesPage, setSuppliesPage] = useState(1);
  const [expensesPage, setExpensesPage] = useState(1);
  const [cashFlowPage, setCashFlowPage] = useState(1);

  // Reset pagination when filters change
  useEffect(() => {
    setSalesPage(1);
  }, [selectedYear, historySearchTerm]);

  useEffect(() => {
    setSuppliesPage(1);
  }, [selectedYear, historySearchTerm]);

  useEffect(() => {
    setExpensesPage(1);
  }, [selectedYear, historySearchTerm]);

  useEffect(() => {
    setCashFlowPage(1);
  }, [selectedYear, historySearchTerm, cashflowTypeFilter]);

  // Format VND Helper
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // 3. TÍNH TOÁN DỮ LIỆU THEO NĂM ĐƯỢC CHỌN (selectedYear)
  const filteredSales = useMemo(() => {
    return selectedYear === 'all'
      ? allPigSales
      : allPigSales.filter((s) => s.saleDate && s.saleDate.startsWith(selectedYear));
  }, [allPigSales, selectedYear]);

  const filteredSupplies = useMemo(() => {
    return selectedYear === 'all'
      ? usedSupplies
      : usedSupplies.filter((u) => u.usedDate && u.usedDate.startsWith(selectedYear));
  }, [usedSupplies, selectedYear]);

  const filteredExpenses = useMemo(() => {
    return selectedYear === 'all'
      ? expenses
      : expenses.filter((e) => e.date && e.date.startsWith(selectedYear));
  }, [expenses, selectedYear]);

  // 4. CHỈ SỐ KPI TÀI CHÍNH
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalPrice, 0);
  const totalPigsSold = filteredSales.reduce((sum, s) => sum + s.totalSoldPigs, 0);
  const totalSuppliesCost = filteredSupplies.reduce(
    (sum, u) => sum + (u.totalCost || u.quantity * (u.unitPrice || 0)),
    0
  );
  const totalExpensesCost = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCost = totalSuppliesCost + totalExpensesCost;
  const netProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';
  const isProfit = netProfit >= 0;

  // Giá trị vốn hàng tồn kho hiện tại
  const totalStockValue = inventoryItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  // 5. BẢNG TỔNG HỢP SO SÁNH TẤT CẢ CÁC NĂM
  const yearSummaries = useMemo(() => {
    return availableYears.map((year) => {
      const sInYear = allPigSales.filter((s) => s.saleDate && s.saleDate.startsWith(year));
      const uInYear = usedSupplies.filter((u) => u.usedDate && u.usedDate.startsWith(year));
      const eInYear = expenses.filter((e) => e.date && e.date.startsWith(year));

      const rev = sInYear.reduce((sum, s) => sum + s.totalPrice, 0);
      const pigs = sInYear.reduce((sum, s) => sum + s.totalSoldPigs, 0);
      const supCost = uInYear.reduce((sum, u) => sum + (u.totalCost || u.quantity * (u.unitPrice || 0)), 0);
      const expCost = eInYear.reduce((sum, e) => sum + e.amount, 0);
      const cost = supCost + expCost;
      const profit = rev - cost;
      const margin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : '0';

      return {
        year,
        salesCount: sInYear.length,
        pigsSold: pigs,
        pigRevenue: rev,
        suppliesCount: uInYear.length,
        suppliesCost: supCost,
        expensesCount: eInYear.length,
        expensesCost: expCost,
        totalCost: cost,
        netProfit: profit,
        profitMargin: margin
      };
    });
  }, [availableYears, allPigSales, usedSupplies, expenses]);

  // Tổng cộng lũy kế toàn bộ các năm
  const allYearsGrandTotal = useMemo(() => {
    return yearSummaries.reduce(
      (acc, curr) => {
        acc.pigsSold += curr.pigsSold;
        acc.salesCount += curr.salesCount;
        acc.pigRevenue += curr.pigRevenue;
        acc.suppliesCost += curr.suppliesCost;
        acc.expensesCost += curr.expensesCost;
        acc.totalCost += curr.totalCost;
        acc.netProfit += curr.netProfit;
        return acc;
      },
      {
        pigsSold: 0,
        salesCount: 0,
        pigRevenue: 0,
        suppliesCost: 0,
        expensesCost: 0,
        totalCost: 0,
        netProfit: 0,
        profitMargin: '0'
      }
    );
  }, [yearSummaries]);

  allYearsGrandTotal.profitMargin =
    allYearsGrandTotal.pigRevenue > 0
      ? ((allYearsGrandTotal.netProfit / allYearsGrandTotal.pigRevenue) * 100).toFixed(1)
      : '0';

  // 6. DỮ LIỆU 12 THÁNG CỦA NĂM ĐƯỢC CHỌN (drilldownYear)
  const activeYearFor12Months = selectedYear === 'all' ? drilldownYear : selectedYear;

  const months12Data = useMemo(() => {
    const result = [];
    for (let m = 1; m <= 12; m++) {
      const monthPrefix = `${activeYearFor12Months}-${m.toString().padStart(2, '0')}`;

      const sInMonth = allPigSales.filter((s) => s.saleDate && s.saleDate.startsWith(monthPrefix));
      const uInMonth = usedSupplies.filter((u) => u.usedDate && u.usedDate.startsWith(monthPrefix));
      const eInMonth = expenses.filter((e) => e.date && e.date.startsWith(monthPrefix));

      const rev = sInMonth.reduce((sum, s) => sum + s.totalPrice, 0);
      const pigs = sInMonth.reduce((sum, s) => sum + s.totalSoldPigs, 0);
      const supCost = uInMonth.reduce((sum, u) => sum + (u.totalCost || u.quantity * (u.unitPrice || 0)), 0);
      const expCost = eInMonth.reduce((sum, e) => sum + e.amount, 0);
      const cost = supCost + expCost;
      const profit = rev - cost;
      const margin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : '0';

      result.push({
        month: m,
        monthLabel: `Tháng ${m.toString().padStart(2, '0')}`,
        salesCount: sInMonth.length,
        pigsSold: pigs,
        pigRevenue: rev,
        suppliesCount: uInMonth.length,
        suppliesCost: supCost,
        expensesCount: eInMonth.length,
        expensesCost: expCost,
        totalCost: cost,
        netProfit: profit,
        profitMargin: margin
      });
    }
    return result;
  }, [activeYearFor12Months, allPigSales, usedSupplies, expenses]);

  // 7. TOÀN BỘ SỔ DÒNG TIỀN LỊCH SỬ (THU & CHI THEO THỜI GIAN)
  const fullCashFlowHistory = useMemo(() => {
    const list: Array<{
      id: string;
      date: string;
      type: 'income' | 'supply_expense' | 'other_expense';
      title: string;
      categoryLabel: string;
      partner: string;
      amount: number;
      notes?: string;
    }> = [];

    // Thu: Bán heo
    filteredSales.forEach((s) => {
      list.push({
        id: `inc-${s.id}`,
        date: s.saleDate,
        type: 'income',
        title: `Bán heo: ${s.batchCode} (${s.sowName})`,
        categoryLabel: s.saleTypeDescription,
        partner: s.buyerName,
        amount: s.totalPrice,
        notes: `Đã bán ${s.totalSoldPigs} con`
      });
    });

    // Chi: Vật tư đã dùng
    filteredSupplies.forEach((u) => {
      list.push({
        id: `sup-${u.id}`,
        date: u.usedDate,
        type: 'supply_expense',
        title: `Xuất dùng: ${u.name}`,
        categoryLabel:
          u.category === 'medicine'
            ? 'Thuốc thú y'
            : u.category === 'feed'
            ? 'Cám & Thức ăn'
            : u.category === 'equipment'
            ? 'Thiết bị'
            : 'Khác',
        partner: u.usedBy || 'Trại nội bộ',
        amount: u.totalCost || u.quantity * (u.unitPrice || 0),
        notes: u.purpose || u.notes
      });
    });

    // Chi: Chi phí phát sinh
    filteredExpenses.forEach((e) => {
      list.push({
        id: `exp-${e.id}`,
        date: e.date,
        type: 'other_expense',
        title: e.title,
        categoryLabel:
          e.category === 'utilities'
            ? 'Điện / Nước'
            : e.category === 'labor'
            ? 'Nhân công'
            : e.category === 'maintenance'
            ? 'Sửa chữa / Vật tư'
            : e.category === 'transport'
            ? 'Vận chuyển'
            : 'Chi phí khác',
        partner: e.payer || 'Trại heo',
        amount: e.amount,
        notes: e.notes
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredSales, filteredSupplies, filteredExpenses]);

  // Lọc tìm kiếm trong Sổ dòng tiền
  const searchedCashFlow = useMemo(() => {
    return fullCashFlowHistory.filter((item) => {
      const matchType =
        cashflowTypeFilter === 'all'
          ? true
          : cashflowTypeFilter === 'income'
          ? item.type === 'income'
          : item.type !== 'income';

      const matchSearch =
        historySearchTerm.trim() === ''
          ? true
          : item.title.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
            item.partner.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
            item.categoryLabel.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
            (item.notes && item.notes.toLowerCase().includes(historySearchTerm.toLowerCase()));

      return matchType && matchSearch;
    });
  }, [fullCashFlowHistory, cashflowTypeFilter, historySearchTerm]);

  // Lọc tìm kiếm trong Lịch sử Bán heo
  const searchedSales = useMemo(() => {
    if (!historySearchTerm.trim()) return filteredSales;
    const term = historySearchTerm.toLowerCase();
    return filteredSales.filter(
      (s) =>
        s.batchCode.toLowerCase().includes(term) ||
        s.sowName.toLowerCase().includes(term) ||
        s.buyerName.toLowerCase().includes(term) ||
        s.saleTypeDescription.toLowerCase().includes(term)
    );
  }, [filteredSales, historySearchTerm]);

  // Lọc tìm kiếm trong Lịch sử Vật tư
  const searchedSupplies = useMemo(() => {
    if (!historySearchTerm.trim()) return filteredSupplies;
    const term = historySearchTerm.toLowerCase();
    return filteredSupplies.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        (u.purpose && u.purpose.toLowerCase().includes(term)) ||
        (u.usedBy && u.usedBy.toLowerCase().includes(term)) ||
        (u.notes && u.notes.toLowerCase().includes(term))
    );
  }, [filteredSupplies, historySearchTerm]);

  // Lọc tìm kiếm trong Lịch sử Chi phí phát sinh
  const searchedExpenses = useMemo(() => {
    if (!historySearchTerm.trim()) return filteredExpenses;
    const term = historySearchTerm.toLowerCase();
    return filteredExpenses.filter(
      (e) =>
        e.title.toLowerCase().includes(term) ||
        (e.payer && e.payer.toLowerCase().includes(term)) ||
        (e.notes && e.notes.toLowerCase().includes(term))
    );
  }, [filteredExpenses, historySearchTerm]);

  // Paginated History Slices (6 items per page)
  const paginatedSales = useMemo(() => {
    return searchedSales.slice((salesPage - 1) * PAGE_SIZE, salesPage * PAGE_SIZE);
  }, [searchedSales, salesPage]);

  const paginatedSupplies = useMemo(() => {
    return searchedSupplies.slice((suppliesPage - 1) * PAGE_SIZE, suppliesPage * PAGE_SIZE);
  }, [searchedSupplies, suppliesPage]);

  const paginatedExpenses = useMemo(() => {
    return searchedExpenses.slice((expensesPage - 1) * PAGE_SIZE, expensesPage * PAGE_SIZE);
  }, [searchedExpenses, expensesPage]);

  const paginatedCashFlow = useMemo(() => {
    return searchedCashFlow.slice((cashFlowPage - 1) * PAGE_SIZE, cashFlowPage * PAGE_SIZE);
  }, [searchedCashFlow, cashFlowPage]);

  // In / Xuất báo cáo
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container">
      {/* 1. HEADER BANNER */}
      <div className="page-header-banner">
        <div>
          {onBack && (
            <button
              type="button"
              className="custom-btn"
              onClick={onBack}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontSize: '0.8rem',
                padding: '0.35rem 0.75rem',
                marginBottom: '0.65rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
            >
              ← Quay Lại Thống Kê Thu Chi
            </button>
          )}
          <h1 className="custom-title-h2">Thống Kê & Lịch Sử Theo Năm</h1>
          <p className="custom-subtitle">
            Báo cáo tổng kết kinh doanh, so sánh qua từng năm và tra cứu toàn bộ lịch sử bán heo, xuất dùng vật tư, chi phí phát sinh.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Bộ chọn năm dropdown */}
          <div style={{ minWidth: '190px' }}>
            <Dropdown
              options={[
                ...availableYears.map((y) => ({
                  label: y === new Date().getFullYear().toString() ? `Năm ${y} (Hiện tại)` : `Năm ${y}`,
                  value: y
                })),
                { label: 'Tất cả các năm (Toàn bộ lịch sử)', value: 'all' }
              ]}
              value={selectedYear}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedYear(val);
                if (val !== 'all') {
                  setDrilldownYear(val);
                }
              }}
            />
          </div>

          {/* Nút In Báo Cáo */}
          <button
            type="button"
            className="custom-btn"
            onClick={handlePrint}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontWeight: 600,
              gap: '0.4rem',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            In Báo Cáo
          </button>
        </div>
      </div>

      {/* 2. CHIP CHỌN NHANH CÁC NĂM */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Chọn nhanh:</span>
        <button
          type="button"
          onClick={() => setSelectedYear('all')}
          style={{
            padding: '0.3rem 0.75rem',
            fontSize: '0.78rem',
            borderRadius: '9999px',
            border: selectedYear === 'all' ? '1px solid var(--primary)' : '1px solid #e2e8f0',
            background: selectedYear === 'all' ? 'var(--primary)' : '#ffffff',
            color: selectedYear === 'all' ? '#ffffff' : '#475569',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Toàn Bộ Lịch Sử
        </button>
        {availableYears.map((yr) => {
          const isActive = selectedYear === yr;
          return (
            <button
              key={yr}
              type="button"
              onClick={() => {
                setSelectedYear(yr);
                setDrilldownYear(yr);
              }}
              style={{
                padding: '0.3rem 0.75rem',
                fontSize: '0.78rem',
                borderRadius: '9999px',
                border: isActive ? '1px solid var(--primary)' : '1px solid #e2e8f0',
                background: isActive ? 'var(--primary)' : '#ffffff',
                color: isActive ? '#ffffff' : '#475569',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Năm {yr}
            </button>
          );
        })}
      </div>

      {/* 3. 4 MAIN KPI STAT CARDS (Responsive & Compact) */}
      <div className="kpi-stats-grid">
        {/* Card 1: Doanh thu bán heo */}
        <div className="kpi-stat-card kpi-card-income">
          <div className="kpi-stat-header">
            <span className="kpi-stat-title">
              {selectedYear === 'all' ? 'TỔNG THU BÁN HEO (LŨY KẾ)' : `THU BÁN HEO NĂM ${selectedYear}`}
            </span>
            <span className="status-pill kpi-stat-pill kpi-pill-income">Thu vào</span>
          </div>
          <div className="kpi-stat-value">
            {formatVND(totalRevenue)}
          </div>
          <div className="kpi-stat-sub">
            Xuất bán {totalPigsSold} con ({filteredSales.length} đợt bán heo)
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
            {formatVND(totalSuppliesCost)}
          </div>
          <div className="kpi-stat-sub">
            Gồm {filteredSupplies.length} lần xuất thuốc, cám, vắc xin
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
            {formatVND(totalExpensesCost)}
          </div>
          <div className="kpi-stat-sub">
            Điện, nước, nhân công ({filteredExpenses.length} khoản)
          </div>
        </div>

        {/* Card 4: Lợi nhuận ròng */}
        <div className={`kpi-stat-card ${isProfit ? 'kpi-card-profit' : 'kpi-card-loss'}`}>
          <div className="kpi-stat-header">
            <span className="kpi-stat-title">
              {selectedYear === 'all' ? 'LỢI NHUẬN RÒNG (LŨY KẾ)' : `LỢI NHUẬN NĂM ${selectedYear}`}
            </span>
            <span className={`status-pill kpi-stat-pill ${isProfit ? 'kpi-pill-profit' : 'kpi-pill-loss'}`}>
              {isProfit ? 'LÃI RÒNG' : 'THÂM HỤT'}
            </span>
          </div>
          <div className="kpi-stat-value">
            {isProfit ? '+' : ''}{formatVND(netProfit)}
          </div>
          <div className="kpi-stat-sub">
            Tỷ suất lợi nhuận: <strong>{profitMargin}%</strong> (Tổng chi: {formatVND(totalCost)})
          </div>
        </div>
      </div>

      {/* Thông tin nhanh phụ: Giá trị tồn kho */}
      <div className="kpi-stats-subbar">
        <div>
          <strong>Vốn hàng tồn kho hiện tại:</strong> <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatVND(totalStockValue)}</span> ({inventoryItems.length} danh mục sẵn sàng sử dụng)
        </div>
        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
          * Vốn tồn kho là tài sản lưu động của trại, chi phí chỉ hạch toán khi vật tư thực tế được xuất kho sử dụng.
        </div>
      </div>

      {/* 4. PHẦN 1: BẢNG THỐNG KÊ TỔNG HỢP SO SÁNH TẤT CẢ CÁC NĂM */}
      <div className="card" style={{ padding: '1.25rem', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700 }}>
              Bảng Tổng Hợp So Sánh Toàn Bộ Các Năm
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Bấm vào "Xem Chi Tiết" để xem toàn bộ lịch sử bán heo, vật tư và 12 tháng của năm tương ứng.
            </p>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Tổng số năm đã lưu: <strong>{availableYears.length} năm</strong>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Năm</th>
                <th>Số Heo Đã Bán</th>
                <th>Doanh Thu Bán Heo</th>
                <th>Chi Phí Vật Tư</th>
                <th>Chi Phí Phát Sinh</th>
                <th>Tổng Chi Phí</th>
                <th>Lợi Nhuận Ròng</th>
                <th>Tỷ Suất LN</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {yearSummaries.map((ys) => {
                const isYsProfit = ys.netProfit >= 0;
                const isCurrentActive = selectedYear === ys.year || (selectedYear === 'all' && drilldownYear === ys.year);

                return (
                  <tr key={ys.year} style={isCurrentActive ? { background: '#f0fdf4' } : undefined}>
                    <td>
                      <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>Năm {ys.year}</strong>
                      {isCurrentActive && (
                        <span style={{ marginLeft: '0.35rem', fontSize: '0.7rem', color: '#15803d', fontWeight: 700 }}>
                          (Đang chọn)
                        </span>
                      )}
                    </td>
                    <td>
                      <strong>{ys.pigsSold} con</strong> ({ys.salesCount} đợt)
                    </td>
                    <td>
                      <strong style={{ color: '#15803d' }}>{formatVND(ys.pigRevenue)}</strong>
                    </td>
                    <td>{formatVND(ys.suppliesCost)}</td>
                    <td>{formatVND(ys.expensesCost)}</td>
                    <td>
                      <strong style={{ color: '#dc2626' }}>{formatVND(ys.totalCost)}</strong>
                    </td>
                    <td>
                      <strong style={{ color: isYsProfit ? '#15803d' : '#dc2626' }}>
                        {isYsProfit ? '+' : ''}{formatVND(ys.netProfit)}
                      </strong>
                    </td>
                    <td>
                      <span
                        className="status-pill"
                        style={{
                          background: isYsProfit ? '#dcfce7' : '#fee2e2',
                          color: isYsProfit ? '#15803d' : '#b91c1c',
                          fontWeight: 700,
                          fontSize: '0.7rem'
                        }}
                      >
                        {ys.profitMargin}%
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedYear(ys.year);
                          setDrilldownYear(ys.year);
                        }}
                        style={{
                          padding: '0.3rem 0.7rem',
                          fontSize: '0.75rem',
                          background: isCurrentActive ? 'var(--primary)' : '#f1f5f9',
                          color: isCurrentActive ? '#fff' : '#334155',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 700,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isCurrentActive ? 'Đang Xem' : 'Xem Chi Tiết'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
                <td>TỔNG CỘNG LŨY KẾ</td>
                <td>{allYearsGrandTotal.pigsSold} con</td>
                <td style={{ color: '#15803d' }}>{formatVND(allYearsGrandTotal.pigRevenue)}</td>
                <td>{formatVND(allYearsGrandTotal.suppliesCost)}</td>
                <td>{formatVND(allYearsGrandTotal.expensesCost)}</td>
                <td style={{ color: '#dc2626' }}>{formatVND(allYearsGrandTotal.totalCost)}</td>
                <td style={{ color: allYearsGrandTotal.netProfit >= 0 ? '#15803d' : '#dc2626' }}>
                  {allYearsGrandTotal.netProfit >= 0 ? '+' : ''}{formatVND(allYearsGrandTotal.netProfit)}
                </td>
                <td>
                  <span
                    className="status-pill"
                    style={{
                      background: allYearsGrandTotal.netProfit >= 0 ? '#dcfce7' : '#fee2e2',
                      color: allYearsGrandTotal.netProfit >= 0 ? '#15803d' : '#b91c1c',
                      fontWeight: 700,
                      fontSize: '0.7rem'
                    }}
                  >
                    {allYearsGrandTotal.profitMargin}%
                  </span>
                </td>
                <td>—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 5. PHẦN 2: CHI TIẾT 12 THÁNG CỦA NĂM ĐƯỢC CHỌN */}
      <div className="card" style={{ padding: '1.25rem', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700 }}>
              Biến Động Doanh Thu & Chi Phí 12 Tháng Năm {activeYearFor12Months}
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Theo dõi chi tiết từng tháng để phát hiện tháng bán chạy hoặc chi phí vật tư tăng cao.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Đổi năm xem:</span>
            <div style={{ width: '130px' }}>
              <Dropdown
                options={availableYears.map((y) => ({ label: `Năm ${y}`, value: y }))}
                value={activeYearFor12Months}
                onChange={(e) => {
                  setDrilldownYear(e.target.value);
                  if (selectedYear !== 'all') {
                    setSelectedYear(e.target.value);
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Số Lượng Bán</th>
                <th>Doanh Thu Heo</th>
                <th>Tiền Vật Tư</th>
                <th>Chi Phí Phát Sinh</th>
                <th>Tổng Chi</th>
                <th>Lợi Nhuận Tháng</th>
                <th>Tỷ Suất LN</th>
              </tr>
            </thead>
            <tbody>
              {months12Data.map((m) => {
                const isMonthProfit = m.netProfit >= 0;
                const hasActivity = m.pigRevenue > 0 || m.totalCost > 0;

                return (
                  <tr key={m.month} style={!hasActivity ? { opacity: 0.6 } : undefined}>
                    <td>
                      <strong>{m.monthLabel}</strong>
                    </td>
                    <td>
                      {m.pigsSold > 0 ? `${m.pigsSold} con (${m.salesCount} đợt)` : '—'}
                    </td>
                    <td>
                      <span style={{ color: m.pigRevenue > 0 ? '#15803d' : '#64748b', fontWeight: m.pigRevenue > 0 ? 700 : 400 }}>
                        {formatVND(m.pigRevenue)}
                      </span>
                    </td>
                    <td>{formatVND(m.suppliesCost)}</td>
                    <td>{formatVND(m.expensesCost)}</td>
                    <td>
                      <span style={{ color: m.totalCost > 0 ? '#dc2626' : '#64748b', fontWeight: m.totalCost > 0 ? 700 : 400 }}>
                        {formatVND(m.totalCost)}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: isMonthProfit ? '#15803d' : '#dc2626' }}>
                        {isMonthProfit && m.netProfit > 0 ? '+' : ''}{formatVND(m.netProfit)}
                      </strong>
                    </td>
                    <td>
                      {m.pigRevenue > 0 ? (
                        <span
                          className="status-pill"
                          style={{
                            background: isMonthProfit ? '#dcfce7' : '#fee2e2',
                            color: isMonthProfit ? '#15803d' : '#b91c1c',
                            fontWeight: 700,
                            fontSize: '0.675rem'
                          }}
                        >
                          {m.profitMargin}%
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
                <td>CẢ NĂM {activeYearFor12Months}</td>
                <td>
                  {months12Data.reduce((s, m) => s + m.pigsSold, 0)} con
                </td>
                <td style={{ color: '#15803d' }}>
                  {formatVND(months12Data.reduce((s, m) => s + m.pigRevenue, 0))}
                </td>
                <td>{formatVND(months12Data.reduce((s, m) => s + m.suppliesCost, 0))}</td>
                <td>{formatVND(months12Data.reduce((s, m) => s + m.expensesCost, 0))}</td>
                <td style={{ color: '#dc2626' }}>
                  {formatVND(months12Data.reduce((s, m) => s + m.totalCost, 0))}
                </td>
                <td>
                  {(() => {
                    const yearProfit =
                      months12Data.reduce((s, m) => s + m.pigRevenue, 0) -
                      months12Data.reduce((s, m) => s + m.totalCost, 0);
                    return (
                      <span style={{ color: yearProfit >= 0 ? '#15803d' : '#dc2626' }}>
                        {yearProfit >= 0 ? '+' : ''}{formatVND(yearProfit)}
                      </span>
                    );
                  })()}
                </td>
                <td>—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 6. PHẦN 3: TRA CỨU TOÀN BỘ LỊCH SỬ CHI TIẾT ("XEM TẤT CẢ LỊCH SỬ HAY NÀY KIA") */}
      <div className="card" style={{ padding: '1.25rem', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700 }}>
              Tra Cứu Lịch Sử Chi Tiết ({selectedYear === 'all' ? 'Toàn Bộ Lịch Sử Các Năm' : `Năm ${selectedYear}`})
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Xem chi tiết từng đợt xuất bán heo, từng lần xuất dùng vật tư hoặc từng khoản chi phí phát sinh.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {selectedYear !== 'all' && (
              <button
                type="button"
                className="custom-btn"
                onClick={() => setSelectedYear('all')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '0.8rem',
                  padding: '0.35rem 0.75rem'
                }}
              >
                ← Xem Lịch Sử Tất Cả Các Năm
              </button>
            )}
          </div>
        </div>

        {/* SUB-TABS LỊCH SỬ */}
        <div className="sub-tabs-wrapper" style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            className={`auth-tab ${historyTab === 'sales' ? 'active' : ''}`}
            onClick={() => setHistoryTab('sales')}
          >
            Lịch Sử Bán Heo ({searchedSales.length})
          </button>
          <button
            type="button"
            className={`auth-tab ${historyTab === 'supplies' ? 'active' : ''}`}
            onClick={() => setHistoryTab('supplies')}
          >
            Lịch Sử Dùng Vật Tư ({searchedSupplies.length})
          </button>
          <button
            type="button"
            className={`auth-tab ${historyTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setHistoryTab('expenses')}
          >
            Lịch Sử Chi Phí Phát Sinh ({searchedExpenses.length})
          </button>
          <button
            type="button"
            className={`auth-tab ${historyTab === 'cashflow' ? 'active' : ''}`}
            onClick={() => setHistoryTab('cashflow')}
          >
            Toàn Bộ Sổ Dòng Tiền ({searchedCashFlow.length})
          </button>
        </div>

        {/* TOOLBAR TÌM KIẾM TRONG LỊCH SỬ */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder={
                historyTab === 'sales'
                  ? 'Tìm theo mã lứa, tên nái, thương lái...'
                  : historyTab === 'supplies'
                  ? 'Tìm theo tên thuốc, cám, mục đích sử dụng...'
                  : historyTab === 'expenses'
                  ? 'Tìm theo tên chi phí, người chi, ghi chú...'
                  : 'Tìm giao dịch trong sổ dòng tiền...'
              }
              value={historySearchTerm}
              onChange={(e) => setHistorySearchTerm(e.target.value)}
            />
          </div>

          {historyTab === 'cashflow' && (
            <div style={{ width: '200px' }}>
              <Dropdown
                options={[
                  { label: 'Tất cả dòng tiền', value: 'all' },
                  { label: 'Chỉ khoản Thu (Bán heo)', value: 'income' },
                  { label: 'Chỉ khoản Chi (Vật tư + Phí)', value: 'expense' }
                ]}
                value={cashflowTypeFilter}
                onChange={(e) => setCashflowTypeFilter(e.target.value as any)}
              />
            </div>
          )}

          {historySearchTerm && (
            <button
              type="button"
              onClick={() => setHistorySearchTerm('')}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.8rem',
                color: '#475569',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Xóa tìm kiếm
            </button>
          )}
        </div>

        {/* TAB 1: LỊCH SỬ BÁN HEO */}
        {historyTab === 'sales' && (
          <>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ngày Bán</th>
                    <th>Mã Lứa Heo</th>
                    <th>Nái Mẹ</th>
                    <th>Mối Mua / Thương Lái</th>
                    <th>Hình Thức Bán</th>
                    <th>Số Lượng</th>
                    <th>Đơn Giá</th>
                    <th>Tổng Thành Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedSales.length > 0 ? (
                    paginatedSales.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <strong>{formatDateVN(s.saleDate)}</strong>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{s.batchCode}</span>
                        </td>
                        <td>{s.sowName}</td>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{s.buyerName}</strong>
                        </td>
                        <td>
                          <span className="status-pill" style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '0.725rem' }}>
                            {s.saleTypeDescription}
                          </span>
                        </td>
                        <td>
                          <strong>{s.totalSoldPigs} con</strong>
                        </td>
                        <td>{s.unitPriceStr}</td>
                        <td>
                          <strong style={{ color: '#15803d', fontSize: '0.875rem' }}>
                            {formatVND(s.totalPrice)}
                          </strong>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        Không có lịch sử bán heo nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
                {searchedSales.length > 0 && (
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan={5}>TỔNG THU BÁN HEO ({searchedSales.length} đợt)</td>
                      <td>{searchedSales.reduce((sum, s) => sum + s.totalSoldPigs, 0)} con</td>
                      <td>—</td>
                      <td style={{ color: '#15803d', fontSize: '0.875rem' }}>
                        {formatVND(searchedSales.reduce((sum, s) => sum + s.totalPrice, 0))}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <Pagination
              currentPage={salesPage}
              totalItems={searchedSales.length}
              pageSize={PAGE_SIZE}
              onPageChange={setSalesPage}
            />
          </>
        )}

        {/* TAB 2: LỊCH SỬ DÙNG VẬT TƯ */}
        {historyTab === 'supplies' && (
          <>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ngày Dùng</th>
                    <th>Tên Vật Tư / Thuốc / Cám</th>
                    <th>Phân Loại</th>
                    <th>Số Lượng Xuất</th>
                    <th>Đơn Giá</th>
                    <th>Thành Tiền (VNĐ)</th>
                    <th>Mục Đích / Chuồng Dùng</th>
                    <th>Người Thực Hiện</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedSupplies.length > 0 ? (
                    paginatedSupplies.map((u) => {
                      const cost = u.totalCost || u.quantity * (u.unitPrice || 0);
                      return (
                        <tr key={u.id}>
                          <td>
                            <strong>{formatDateVN(u.usedDate)}</strong>
                          </td>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{u.name}</strong>
                            {u.notes && <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.15rem' }}>{u.notes}</div>}
                          </td>
                          <td>
                            <span
                              className="status-pill"
                              style={{
                                background: u.category === 'medicine' ? '#fef3c7' : u.category === 'feed' ? '#ecfdf5' : '#f1f5f9',
                                color: u.category === 'medicine' ? '#b45309' : u.category === 'feed' ? '#059669' : '#475569',
                                fontSize: '0.7rem'
                              }}
                            >
                              {u.category === 'medicine' ? 'Thuốc thú y' : u.category === 'feed' ? 'Cám thức ăn' : 'Trang thiết bị'}
                            </span>
                          </td>
                          <td>
                            <strong>{u.quantity}</strong> {u.unit}
                          </td>
                          <td>{u.unitPrice ? formatVND(u.unitPrice) : '—'}</td>
                          <td>
                            <strong style={{ color: '#e11d48' }}>{formatVND(cost)}</strong>
                          </td>
                          <td>{u.purpose || 'Xuất chuồng trại'}</td>
                          <td>{u.usedBy || '—'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        Không có lịch sử xuất dùng vật tư nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
                {searchedSupplies.length > 0 && (
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan={5}>TỔNG TIỀN VẬT TƯ ĐÃ DÙNG ({searchedSupplies.length} lần)</td>
                      <td style={{ color: '#e11d48', fontSize: '0.875rem' }}>
                        {formatVND(searchedSupplies.reduce((sum, u) => sum + (u.totalCost || u.quantity * (u.unitPrice || 0)), 0))}
                      </td>
                      <td colSpan={2}>—</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <Pagination
              currentPage={suppliesPage}
              totalItems={searchedSupplies.length}
              pageSize={PAGE_SIZE}
              onPageChange={setSuppliesPage}
            />
          </>
        )}

        {/* TAB 3: LỊCH SỬ CHI PHÍ PHÁT SINH */}
        {historyTab === 'expenses' && (
          <>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ngày Chi</th>
                    <th>Khoản Chi Phí Phát Sinh</th>
                    <th>Phân Loại</th>
                    <th>Người Thanh Toán</th>
                    <th>Số Tiền (VNĐ)</th>
                    <th>Ghi Chú</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedExpenses.length > 0 ? (
                    paginatedExpenses.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <strong>{formatDateVN(e.date)}</strong>
                        </td>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{e.title}</strong>
                        </td>
                        <td>
                          <span
                            className="status-pill"
                            style={{
                              background:
                                e.category === 'utilities'
                                  ? '#fef3c7'
                                  : e.category === 'labor'
                                  ? '#e0e7ff'
                                  : e.category === 'maintenance'
                                  ? '#f3e8ff'
                                  : '#e0f2fe',
                              color:
                                e.category === 'utilities'
                                  ? '#b45309'
                                  : e.category === 'labor'
                                  ? '#4338ca'
                                  : e.category === 'maintenance'
                                  ? '#7e22ce'
                                  : '#0369a1',
                              fontSize: '0.7rem'
                            }}
                          >
                            {e.category === 'utilities'
                              ? 'Điện / Nước'
                              : e.category === 'labor'
                              ? 'Nhân công'
                              : e.category === 'maintenance'
                              ? 'Sửa chữa'
                              : e.category === 'transport'
                              ? 'Vận chuyển'
                              : 'Chi phí khác'}
                          </span>
                        </td>
                        <td>{e.payer || 'Trại heo'}</td>
                        <td>
                          <strong style={{ color: '#d97706', fontSize: '0.875rem' }}>
                            {formatVND(e.amount)}
                          </strong>
                        </td>
                        <td style={{ color: '#64748b' }}>{e.notes || '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        Không có chi phí phát sinh nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
                {searchedExpenses.length > 0 && (
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan={4}>TỔNG CHI PHÍ PHÁT SINH ({searchedExpenses.length} khoản)</td>
                      <td style={{ color: '#d97706', fontSize: '0.875rem' }}>
                        {formatVND(searchedExpenses.reduce((sum, e) => sum + e.amount, 0))}
                      </td>
                      <td>—</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <Pagination
              currentPage={expensesPage}
              totalItems={searchedExpenses.length}
              pageSize={PAGE_SIZE}
              onPageChange={setExpensesPage}
            />
          </>
        )}

        {/* TAB 4: TOÀN BỘ SỔ DÒNG TIỀN LỊCH SỬ */}
        {historyTab === 'cashflow' && (
          <>
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
                  {searchedCashFlow.length > 0 ? (
                    paginatedCashFlow.map((cf) => {
                      const isIncome = cf.type === 'income';
                      return (
                        <tr key={cf.id}>
                          <td>
                            <strong>{formatDateVN(cf.date)}</strong>
                          </td>
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
                            <strong style={{ color: '#0f172a' }}>{cf.title}</strong>
                          </td>
                          <td>{cf.categoryLabel}</td>
                          <td>{cf.partner}</td>
                          <td>
                            <strong style={{ color: isIncome ? '#15803d' : '#dc2626', fontSize: '0.85rem' }}>
                              {isIncome ? '+' : '-'}{formatVND(cf.amount)}
                            </strong>
                          </td>
                          <td style={{ color: '#64748b' }}>{cf.notes || '—'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        Không có giao dịch dòng tiền nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
                {searchedCashFlow.length > 0 && (
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan={5}>
                        TỔNG KẾT DÒNG TIỀN HIỂN THỊ ({searchedCashFlow.length} giao dịch)
                      </td>
                      <td colSpan={2}>
                        <span style={{ color: '#15803d', marginRight: '1rem' }}>
                          Thu: +{formatVND(searchedCashFlow.filter((c) => c.type === 'income').reduce((s, c) => s + c.amount, 0))}
                        </span>
                        <span style={{ color: '#dc2626' }}>
                          Chi: -{formatVND(searchedCashFlow.filter((c) => c.type !== 'income').reduce((s, c) => s + c.amount, 0))}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <Pagination
              currentPage={cashFlowPage}
              totalItems={searchedCashFlow.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCashFlowPage}
            />
          </>
        )}
      </div>
    </div>
  );
};
