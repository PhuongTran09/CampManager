import React, { useState, useMemo, useEffect } from 'react';
import type { InventoryItem, UsedSupplyRecord } from '../types';
import { Button, Input, Dropdown, toast, useConfirm, Pagination } from '../components/common';
import { formatDateVN } from '../utils';

interface InventoryPageProps {
  items: InventoryItem[];
  usedSupplies?: UsedSupplyRecord[];
  onAddItem: (newItem: InventoryItem) => void;
  onUpdateItem: (updatedItem: InventoryItem) => void;
  onDeleteItem?: (itemId: string) => void;
  onAddUsedSupply?: (newRecord: UsedSupplyRecord) => void;
  onDeleteUsedSupply?: (recordId: string) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  items,
  usedSupplies = [],
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddUsedSupply,
  onDeleteUsedSupply
}) => {
  const confirm = useConfirm();

  // Navigation Tabs: Tồn kho vs Đã sử dụng
  const [activeTab, setActiveTab] = useState<'stock' | 'used'>('stock');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editMode, setEditMode] = useState<'add' | 'use' | 'info'>('add');

  // Form State: Add Stock
  const [addQuantity, setAddQuantity] = useState('1');
  const [addUnitPrice, setAddUnitPrice] = useState('');
  const [addDate, setAddDate] = useState(new Date().toISOString().split('T')[0]);
  const [addNotes, setAddNotes] = useState('');

  // Form State: Edit Details
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<InventoryItem['category']>('medicine');
  const [editUnit, setEditUnit] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnitPriceField, setEditUnitPriceField] = useState('');
  const [editMinQuantity, setEditMinQuantity] = useState('');
  const [editSupplier, setEditSupplier] = useState('');
  const [editNotesField, setEditNotesField] = useState('');

  // Filters for Stock
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filters for Used Supplies
  const [usedSearchTerm, setUsedSearchTerm] = useState('');
  const [usedCategoryFilter, setUsedCategoryFilter] = useState<string>('all');

  // Phân trang: Mỗi trang 6 mục nếu danh sách > 6
  const PAGE_SIZE = 6;
  const [stockPage, setStockPage] = useState(1);
  const [usedPage, setUsedPage] = useState(1);

  useEffect(() => {
    setStockPage(1);
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    setUsedPage(1);
  }, [usedSearchTerm, usedCategoryFilter]);

  // Form State: Add new Item to Stock
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('medicine');
  const [unit, setUnit] = useState('Chai');
  const [quantity, setQuantity] = useState('10');
  const [minQuantity, setMinQuantity] = useState('5');
  const [unitPrice, setUnitPrice] = useState('100000');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');

  // Form State: Log Used Supply
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [useQuantity, setUseQuantity] = useState<string>('1');
  const [useDate, setUseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [useNotes, setUseNotes] = useState<string>('');

  // Filtered Stock Items
  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const paginatedItems = useMemo(() => {
    return filteredItems.slice((stockPage - 1) * PAGE_SIZE, stockPage * PAGE_SIZE);
  }, [filteredItems, stockPage]);

  // Filtered Used Supplies
  const filteredUsedSupplies = usedSupplies.filter((record) => {
    const matchSearch =
      record.name.toLowerCase().includes(usedSearchTerm.toLowerCase()) ||
      (record.notes && record.notes.toLowerCase().includes(usedSearchTerm.toLowerCase()));
    const matchCategory = usedCategoryFilter === 'all' || record.category === usedCategoryFilter;
    return matchSearch && matchCategory;
  });

  const paginatedUsedSupplies = useMemo(() => {
    return filteredUsedSupplies.slice((usedPage - 1) * PAGE_SIZE, usedPage * PAGE_SIZE);
  }, [filteredUsedSupplies, usedPage]);

  // Handle Add Item to Stock
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Vui lòng nhập tên vật tư.');
      return;
    }

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: name.trim(),
      category,
      unit: unit.trim() || 'đơn vị',
      quantity: Number(quantity) || 0,
      minQuantity: Number(minQuantity) || 0,
      unitPrice: Number(unitPrice) || 0,
      supplier: supplier.trim() || undefined,
      lastUpdated: new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined
    };

    onAddItem(newItem);
    setShowAddModal(false);
    setName('');
    setSupplier('');
    setNotes('');
    toast.success(`Đã thêm vật tư "${newItem.name}" vào kho!`);
  };

  // Open Edit / Adjust modal for a specific item
  const handleOpenEditModal = (item: InventoryItem, initialMode: 'add' | 'use' | 'info' = 'add') => {
    setEditingItem(item);
    setEditMode(initialMode);

    // Reset Add Stock Form
    setAddQuantity('1');
    setAddUnitPrice(String(item.unitPrice || ''));
    setAddDate(new Date().toISOString().split('T')[0]);
    setAddNotes('');

    // Reset Use Form
    setSelectedItemId(item.id);
    setUseQuantity('1');
    setUseDate(new Date().toISOString().split('T')[0]);
    setUseNotes('');

    // Reset Info Form
    setEditName(item.name);
    setEditCategory(item.category);
    setEditUnit(item.unit);
    setEditQuantity(String(item.quantity));
    setEditUnitPriceField(String(item.unitPrice || ''));
    setEditMinQuantity(String(item.minQuantity || ''));
    setEditSupplier(item.supplier || '');
    setEditNotesField(item.notes || '');

    setShowEditModal(true);
  };

  // Submit Add Stock in Edit Modal
  const handleConfirmAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const qtyToAdd = Number(addQuantity);
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      toast.warning('Số lượng thêm phải lớn hơn 0.');
      return;
    }

    const newUnitPrice = addUnitPrice !== '' && !isNaN(Number(addUnitPrice))
      ? Math.max(0, Number(addUnitPrice))
      : editingItem.unitPrice;

    const updatedItem: InventoryItem = {
      ...editingItem,
      quantity: editingItem.quantity + qtyToAdd,
      unitPrice: newUnitPrice,
      lastUpdated: addDate || new Date().toISOString().split('T')[0],
      notes: addNotes.trim()
        ? (editingItem.notes ? `${editingItem.notes}; ${addNotes.trim()}` : addNotes.trim())
        : editingItem.notes
    };

    onUpdateItem(updatedItem);
    setShowEditModal(false);
    toast.success(`Đã nhập thêm ${qtyToAdd} ${editingItem.unit} "${editingItem.name}" vào kho!`);
  };

  // Submit Use in Edit Modal
  const handleConfirmUseInEditModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const qtyToUse = Number(useQuantity);
    if (isNaN(qtyToUse) || qtyToUse <= 0) {
      toast.warning('Số lượng sử dụng phải lớn hơn 0.');
      return;
    }

    if (qtyToUse > editingItem.quantity) {
      toast.error(`Số lượng sử dụng (${qtyToUse} ${editingItem.unit}) vượt quá lượng tồn kho hiện có (${editingItem.quantity} ${editingItem.unit})!`);
      return;
    }

    // Deduct from stock
    const updatedItem: InventoryItem = {
      ...editingItem,
      quantity: editingItem.quantity - qtyToUse,
      lastUpdated: useDate || new Date().toISOString().split('T')[0]
    };
    onUpdateItem(updatedItem);

    // Add to used supplies log
    if (onAddUsedSupply) {
      const unitPrice = editingItem.unitPrice || 0;
      const totalCost = qtyToUse * unitPrice;
      const record: UsedSupplyRecord = {
        id: `used-${Date.now()}`,
        itemId: editingItem.id,
        name: editingItem.name,
        category: editingItem.category,
        quantity: qtyToUse,
        unit: editingItem.unit,
        unitPrice,
        totalCost,
        usedDate: useDate || new Date().toISOString().split('T')[0],
        notes: useNotes.trim() || undefined
      };
      onAddUsedSupply(record);
    }

    setShowEditModal(false);
    toast.success(`Đã xuất dùng ${qtyToUse} ${editingItem.unit} "${editingItem.name}"!`);
  };

  // Submit Info Change in Edit Modal
  const handleConfirmEditInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editName.trim()) {
      toast.warning('Vui lòng nhập tên vật tư.');
      return;
    }

    const qty = Number(editQuantity);
    const uPrice = Number(editUnitPriceField);
    const mQty = Number(editMinQuantity);

    const updatedItem: InventoryItem = {
      ...editingItem,
      name: editName.trim(),
      category: editCategory,
      unit: editUnit.trim() || 'đơn vị',
      quantity: !isNaN(qty) && qty >= 0 ? qty : editingItem.quantity,
      unitPrice: !isNaN(uPrice) && uPrice >= 0 ? uPrice : editingItem.unitPrice,
      minQuantity: !isNaN(mQty) && mQty >= 0 ? mQty : editingItem.minQuantity,
      supplier: editSupplier.trim() || undefined,
      notes: editNotesField.trim() || undefined,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    onUpdateItem(updatedItem);
    setShowEditModal(false);
    toast.success(`Đã cập nhật thông tin "${updatedItem.name}"!`);
  };

  // Open modal to record usage for a specific item
  const handleOpenUseModal = (item?: InventoryItem) => {
    if (item) {
      handleOpenEditModal(item, 'use');
      return;
    }
    if (items.length > 0) {
      setSelectedItemId(items[0].id);
    }
    setUseQuantity('1');
    setUseDate(new Date().toISOString().split('T')[0]);
    setUseNotes('');
    setShowUseModal(true);
  };

  // Submit Usage Form
  const handleConfirmUseSupply = (e: React.FormEvent) => {
    e.preventDefault();
    const targetItem = items.find((i) => i.id === selectedItemId);
    if (!targetItem) {
      toast.warning('Vui lòng chọn vật tư hợp lệ.');
      return;
    }

    const qtyToUse = Number(useQuantity);
    if (isNaN(qtyToUse) || qtyToUse <= 0) {
      toast.warning('Số lượng sử dụng phải lớn hơn 0.');
      return;
    }

    if (qtyToUse > targetItem.quantity) {
      toast.error(`Số lượng sử dụng (${qtyToUse} ${targetItem.unit}) vượt quá lượng tồn kho hiện có (${targetItem.quantity} ${targetItem.unit})!`);
      return;
    }

    // Deduct from stock
    const updatedItem: InventoryItem = {
      ...targetItem,
      quantity: targetItem.quantity - qtyToUse,
      lastUpdated: useDate || new Date().toISOString().split('T')[0]
    };
    onUpdateItem(updatedItem);

    // Add to used supplies log
    if (onAddUsedSupply) {
      const unitPrice = targetItem.unitPrice || 0;
      const totalCost = qtyToUse * unitPrice;
      const record: UsedSupplyRecord = {
        id: `used-${Date.now()}`,
        itemId: targetItem.id,
        name: targetItem.name,
        category: targetItem.category,
        quantity: qtyToUse,
        unit: targetItem.unit,
        unitPrice,
        totalCost,
        usedDate: useDate || new Date().toISOString().split('T')[0],
        notes: useNotes.trim() || undefined
      };
      onAddUsedSupply(record);
    }

    setShowUseModal(false);
    toast.success(`Đã ghi nhận xuất dùng ${qtyToUse} ${targetItem.unit} "${targetItem.name}"!`);
  };

  const getCategoryBadge = (cat: InventoryItem['category']) => {
    switch (cat) {
      case 'medicine':
        return <span className="status-pill" style={{ background: '#ffedd5', color: '#c2410c', fontWeight: 700 }}>Thuốc Thú Y</span>;
      case 'feed':
        return <span className="status-pill" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>Cám & Thức Ăn</span>;
      case 'equipment':
        return <span className="status-pill" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>Trang Thiết Bị</span>;
      default:
        return <span className="status-pill" style={{ background: '#f1f5f9', color: '#475569' }}>Khác</span>;
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const currentSelectedItem = items.find((i) => i.id === selectedItemId);

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div>
          <h1 className="custom-title-h2">Quản Lý Kho Vật Tư & Thức Ăn</h1>
          <p className="custom-subtitle">
            Theo dõi tồn kho thuốc thú y, cám dinh dưỡng, thiết bị chăn nuôi và nhật ký vật tư đã sử dụng.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="outline" onClick={() => handleOpenUseModal()}>
            + Ghi Nhận Sử Dụng
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            + Nhập Kho Vật Tư Mới
          </Button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="sub-tabs-wrapper" style={{ marginBottom: '1.25rem' }}>
        <button
          className={`auth-tab ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          Tồn Kho Vật Tư ({items.length})
        </button>
        <button
          className={`auth-tab ${activeTab === 'used' ? 'active' : ''}`}
          onClick={() => setActiveTab('used')}
        >
          Vật Tư Đã Sử Dụng ({usedSupplies.length})
        </button>
      </div>

      {/* Financial Quick Cards */}
      <div className="kpi-stats-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="kpi-stat-card kpi-card-neutral">
          <div className="kpi-stat-title">Tổng Vốn Hàng Tồn Trong Kho</div>
          <div className="kpi-stat-value-sm">
            {formatVND(items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0))}
          </div>
          <div className="kpi-stat-sub">
            Gồm {items.length} danh mục vật tư sẵn sàng sử dụng
          </div>
        </div>

        <div className="kpi-stat-card kpi-card-loss">
          <div className="kpi-stat-title">Tổng Tiền Vật Tư Đã Xuất Dùng</div>
          <div className="kpi-stat-value-sm">
            {formatVND(usedSupplies.reduce((sum, u) => sum + (u.totalCost || (u.quantity * (u.unitPrice || 0))), 0))}
          </div>
          <div className="kpi-stat-sub">
            Ghi nhận qua {usedSupplies.length} lần xuất dùng thuốc, cám, vắc xin
          </div>
        </div>
      </div>

      {/* TAB 1: TỒN KHO VẬT TƯ */}
      {activeTab === 'stock' && (
        <>
          {/* Filter & Toolbar */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <Input
                placeholder="Tìm theo Tên vật tư, Nhà cung cấp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ width: '220px' }}>
              <Dropdown
                options={[
                  { label: 'Tất cả danh mục kho', value: 'all' },
                  { label: 'Thuốc Thú Y', value: 'medicine' },
                  { label: 'Cám & Thức Ăn', value: 'feed' },
                  { label: 'Trang Thiết Bị', value: 'equipment' },
                  { label: 'Khác', value: 'other' }
                ]}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Inventory Table */}
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Danh Mục</th>
                  <th>Tên Vật Tư / Thuốc / Cám</th>
                  <th>Đơn Vị</th>
                  <th>Số Lượng Tồn</th>
                  <th>Đơn Giá (VNĐ)</th>
                  <th>Nhà Cung Cấp & Ghi Chú</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  paginatedItems.map((item) => {
                    const isLowStock = item.quantity <= item.minQuantity;
                    return (
                      <tr key={item.id}>
                        <td>{getCategoryBadge(item.category)}</td>
                        <td>
                          <strong>{item.name}</strong>
                          {isLowStock && (
                            <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 700, marginTop: '0.15rem' }}>
                              Tồn kho sắp hết (dưới {item.minQuantity} {item.unit})
                            </div>
                          )}
                        </td>
                        <td>{item.unit}</td>
                        <td>
                          <strong style={{ fontSize: '0.85rem', color: isLowStock ? '#dc2626' : 'var(--primary)' }}>
                            {item.quantity}
                          </strong>
                        </td>
                        <td>{formatVND(item.unitPrice)}</td>
                        <td>
                          <div>{item.supplier || 'Chưa có nhà cung cấp'}</div>
                          {item.notes && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.notes}</div>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item, 'info')}
                              style={{
                                padding: '0.25rem 0.6rem',
                                fontSize: '0.725rem',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                              title="Chỉnh sửa vật tư (thêm tồn kho hoặc xuất dùng)"
                            >
                              Chỉnh Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item, 'use')}
                              style={{
                                padding: '0.25rem 0.6rem',
                                fontSize: '0.725rem',
                                background: '#fef3c7',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                              title="Ghi nhận xuất dùng vật tư"
                            >
                              Xuất Dùng
                            </button>
                            {onDeleteItem && (
                              <button
                                type="button"
                                onClick={() => {
                                  confirm({
                                    title: 'Xác Nhận Xóa Vật Tư',
                                    message: `Bạn có chắc chắn muốn xóa vật tư "${item.name}" khỏi danh sách kho không?`,
                                    description: 'Toàn bộ thông tin tồn kho của vật tư này sẽ bị xóa.',
                                    confirmText: 'Xác Nhận Xóa',
                                    onConfirm: () => {
                                      onDeleteItem(item.id);
                                      toast.success(`Đã xóa vật tư "${item.name}" khỏi kho!`);
                                    }
                                  });
                                }}
                                style={{
                                  padding: '0.25rem 0.55rem',
                                  fontSize: '0.725rem',
                                  background: '#fef2f2',
                                  color: '#dc2626',
                                  border: '1px solid #fecaca',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                                title="Xóa vật tư này khỏi kho"
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      Chưa có vật tư nào trong danh mục này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={stockPage}
            totalItems={filteredItems.length}
            pageSize={PAGE_SIZE}
            onPageChange={setStockPage}
          />
        </>
      )}

      {/* TAB 2: VẬT TƯ ĐÃ SỬ DỤNG */}
      {activeTab === 'used' && (
        <>
          {/* Filter & Toolbar */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <Input
                placeholder="Tìm theo Tên vật tư, Ghi chú..."
                value={usedSearchTerm}
                onChange={(e) => setUsedSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ width: '220px' }}>
              <Dropdown
                options={[
                  { label: 'Tất cả danh mục', value: 'all' },
                  { label: 'Thuốc Thú Y', value: 'medicine' },
                  { label: 'Cám & Thức Ăn', value: 'feed' },
                  { label: 'Trang Thiết Bị', value: 'equipment' },
                  { label: 'Khác', value: 'other' }
                ]}
                value={usedCategoryFilter}
                onChange={(e) => setUsedCategoryFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Used Supplies Table */}
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ngày Sử Dụng</th>
                  <th>Danh Mục</th>
                  <th>Tên Vật Tư / Thuốc / Cám</th>
                  <th>Số Lượng</th>
                  <th>Đơn Giá (VNĐ)</th>
                  <th>Thành Tiền (VNĐ)</th>
                  <th>Ghi Chú</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsedSupplies.length > 0 ? (
                  paginatedUsedSupplies.map((record) => {
                    const price = record.unitPrice || 0;
                    const cost = record.totalCost || (record.quantity * price);
                    return (
                      <tr key={record.id}>
                        <td><strong>{formatDateVN(record.usedDate)}</strong></td>
                        <td>{getCategoryBadge(record.category)}</td>
                        <td><strong>{record.name}</strong></td>
                        <td>
                          <strong style={{ color: '#0369a1', fontSize: '0.825rem' }}>
                            {record.quantity} {record.unit}
                          </strong>
                        </td>
                        <td>{formatVND(price)}</td>
                        <td>
                          <strong style={{ color: '#dc2626', fontSize: '0.825rem' }}>{formatVND(cost)}</strong>
                        </td>
                        <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {record.notes || '—'}
                        </td>
                        <td>
                          {onDeleteUsedSupply && (
                            <button
                              type="button"
                              onClick={() => {
                                confirm({
                                  title: 'Xác Nhận Xóa Lịch Sử Sử Dụng',
                                  message: `Bạn có chắc chắn muốn xóa bản ghi xuất dùng "${record.name}" ngày ${formatDateVN(record.usedDate)} không?`,
                                  description: 'Bản ghi sử dụng này sẽ được gỡ bỏ khỏi nhật ký.',
                                  confirmText: 'Xác Nhận Xóa',
                                  onConfirm: () => {
                                    onDeleteUsedSupply(record.id);
                                    toast.success(`Đã xóa lịch sử xuất dùng "${record.name}"!`);
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
                              title="Xóa lịch sử xuất dùng này"
                            >
                              Xóa
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      Chưa có ghi nhận sử dụng vật tư nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={usedPage}
            totalItems={filteredUsedSupplies.length}
            pageSize={PAGE_SIZE}
            onPageChange={setUsedPage}
          />
        </>
      )}

      {/* Modal Nhập Kho Mới */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in">
            <div className="modal-header">
              <h3>Nhập Vật Tư / Thuốc / Cám Mới Vào Kho</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateItem} className="modal-form">
              <div className="form-grid-2-1">
                <Input
                  label="Tên Vật Tư / Thuốc / Cám"
                  placeholder="VD: Vắc xin Dịch Tả, Cám Nái Mang Thai..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Dropdown
                  label="Phân Loại Vật Tư"
                  options={[
                    { label: 'Thuốc Thú Y & Vắc Xin', value: 'medicine' },
                    { label: 'Cám & Thức Ăn Chăn Nuôi', value: 'feed' },
                    { label: 'Trang Thiết Bị & Dụng Cụ', value: 'equipment' },
                    { label: 'Vật Tư Khác', value: 'other' }
                  ]}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                />
              </div>

              <div className="form-grid-3">
                <Input
                  label="Đơn Vị Tính"
                  placeholder="VD: Chai, Bao, Cái..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                />
                <Input
                  label="Số Lượng Ban Đầu"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
                <Input
                  label="Cảnh Báo Tồn Nhỏ Hơn"
                  type="number"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(e.target.value)}
                />
              </div>

              <div className="form-grid-2">
                <Input
                  label="Đơn Giá (VNĐ)"
                  type="number"
                  placeholder="VD: 150000"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                />
                <Input
                  label="Nhà Cung Cấp"
                  placeholder="VD: C.P. Việt Nam, Navetco..."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>

              <Input
                label="Ghi Chú Bảo Quản / Vị Trí Kho"
                placeholder="VD: Ngăn mát tủ lạnh, Kho B - Kệ 2..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="modal-actions">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Hủy</Button>
                <Button type="submit" variant="primary">Lưu Vào Kho</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ghi Nhận Sử Dụng Vật Tư */}
      {showUseModal && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>Ghi Nhận Sử Dụng / Xuất Kho Vật Tư</h3>
              <button className="close-btn" onClick={() => setShowUseModal(false)}>✕</button>
            </div>
            <form onSubmit={handleConfirmUseSupply} className="modal-form">
              <div>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                  Chọn Vật Tư / Thuốc / Cám Xuất Dùng
                </label>
                <Dropdown
                  options={items.map((i) => ({
                    label: `${i.name} (Tồn: ${i.quantity} ${i.unit})`,
                    value: i.id
                  }))}
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                />
                {currentSelectedItem && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.45rem 0.75rem', borderRadius: '6px', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#166534' }}>
                      Còn tồn: <strong>{currentSelectedItem.quantity} {currentSelectedItem.unit}</strong> (Đơn giá: {formatVND(currentSelectedItem.unitPrice)})
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 800 }}>
                      Thành tiền: {formatVND(Math.max(0, Number(useQuantity) || 0) * currentSelectedItem.unitPrice)}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-grid-2">
                <Input
                  label={`Số Lượng Xuất Dùng (${currentSelectedItem?.unit || 'đơn vị'})`}
                  type="number"
                  min="0.1"
                  step="any"
                  max={currentSelectedItem?.quantity || 9999}
                  value={useQuantity}
                  onChange={(e) => setUseQuantity(e.target.value)}
                  required
                />
                <Input
                  label="Ngày Sử Dụng"
                  type="date"
                  value={useDate}
                  onChange={(e) => setUseDate(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Ghi Chú Bổ Sung"
                placeholder="VD: Liều lượng 10ml, dùng hết trong ca sáng..."
                value={useNotes}
                onChange={(e) => setUseNotes(e.target.value)}
              />

              <div className="modal-actions">
                <Button type="button" variant="outline" onClick={() => setShowUseModal(false)}>
                  Hủy Bỏ
                </Button>
                <Button type="submit" variant="primary">
                  Xác Nhận Xuất Dùng
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa / Điều Chỉnh Vật Tư (Thêm hoặc Xuất dùng hoặc Sửa chi tiết) */}
      {showEditModal && editingItem && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in" style={{ maxWidth: '540px' }}>
            <div className="modal-header" style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {editingItem.name}
                  </h3>
                  {getCategoryBadge(editingItem.category)}
                </div>
                <div className="inventory-modal-subtitle">
                  Tồn: <strong style={{ color: editingItem.quantity <= editingItem.minQuantity ? '#dc2626' : 'var(--primary)' }}>{editingItem.quantity} {editingItem.unit}</strong>
                  <span className="inventory-modal-subtitle-sep">•</span>
                  Giá: <strong>{formatVND(editingItem.unitPrice)}</strong>
                  {editingItem.supplier && (
                    <>
                      <span className="inventory-modal-subtitle-sep">•</span>
                      <span>{editingItem.supplier}</span>
                    </>
                  )}
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowEditModal(false)} title="Đóng">✕</button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="inventory-modal-tabs">
              <button
                type="button"
                className={`inventory-modal-tab-btn ${editMode === 'info' ? 'active-info' : ''}`}
                onClick={() => setEditMode('info')}
              >
                Sửa Chi Tiết
              </button>
              <button
                type="button"
                className={`inventory-modal-tab-btn ${editMode === 'add' ? 'active-add' : ''}`}
                onClick={() => setEditMode('add')}
              >
                Nhập Thêm
              </button>
              <button
                type="button"
                className={`inventory-modal-tab-btn ${editMode === 'use' ? 'active-use' : ''}`}
                onClick={() => setEditMode('use')}
              >
                Xuất Dùng
              </button>
            </div>

            {/* Mode 1: SỬA CHI TIẾT THÔNG TIN */}
            {editMode === 'info' && (
              <form onSubmit={handleConfirmEditInfo} className="modal-form">
                <div className="form-grid-2-1">
                  <Input
                    label="Tên Vật Tư / Thuốc / Cám"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                  <Dropdown
                    label="Phân Loại"
                    options={[
                      { label: 'Thuốc Thú Y', value: 'medicine' },
                      { label: 'Cám & Thức Ăn', value: 'feed' },
                      { label: 'Trang Thiết Bị', value: 'equipment' },
                      { label: 'Khác', value: 'other' }
                    ]}
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as InventoryItem['category'])}
                  />
                </div>

                <div className="form-grid-stock-unit">
                  <Input
                    label="Đơn Vị Tính"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    placeholder="VD: Chai, Bao, Lọ..."
                    required
                  />
                  <Input
                    label="Số Lượng Tồn Kho"
                    type="number"
                    min="0"
                    step="any"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    required
                  />
                  <div className="form-grid-price-field">
                    <Input
                      label="Đơn Giá (VNĐ)"
                      type="number"
                      min="0"
                      value={editUnitPriceField}
                      onChange={(e) => setEditUnitPriceField(e.target.value)}
                      placeholder="VD: 150000"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <Input
                    label="Cảnh Báo Tồn Nhỏ Hơn"
                    type="number"
                    min="0"
                    value={editMinQuantity}
                    onChange={(e) => setEditMinQuantity(e.target.value)}
                    placeholder="VD: 5"
                  />
                  <Input
                    label="Nhà Cung Cấp"
                    value={editSupplier}
                    onChange={(e) => setEditSupplier(e.target.value)}
                    placeholder="VD: C.P., Navetco..."
                  />
                </div>

                <Input
                  label="Ghi Chú Vị Trí / Bảo Quản"
                  value={editNotesField}
                  onChange={(e) => setEditNotesField(e.target.value)}
                  placeholder="VD: Ngăn mát tủ lạnh, Kệ số 2..."
                />

                <div className="modal-actions">
                  <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                    Hủy Bỏ
                  </Button>
                  <Button type="submit" variant="primary">
                    Lưu Thay Đổi
                  </Button>
                </div>
              </form>
            )}

            {/* Mode 2: THÊM VÀO KHO */}
            {editMode === 'add' && (
              <form onSubmit={handleConfirmAddStock} className="modal-form">
                <div className="inventory-stock-preview preview-add">
                  <div>
                    <span className="preview-label">Tồn kho hiện có:</span>
                    <div className="preview-val">
                      {editingItem.quantity} {editingItem.unit}
                    </div>
                  </div>
                  <div className="preview-arrow">→</div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="preview-label">Sau khi nhập:</span>
                    <div className="preview-val preview-val-highlight">
                      {(editingItem.quantity + Math.max(0, Number(addQuantity) || 0))} {editingItem.unit}
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <Input
                    label={`Số Lượng Nhập Thêm (${editingItem.unit})`}
                    type="number"
                    min="0.1"
                    step="any"
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(e.target.value)}
                    placeholder="VD: 5, 10..."
                    required
                  />
                  <Input
                    label="Ngày Nhập Hàng"
                    type="date"
                    value={addDate}
                    onChange={(e) => setAddDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <Input
                    label="Đơn Giá Nhập (VNĐ)"
                    type="number"
                    value={addUnitPrice}
                    onChange={(e) => setAddUnitPrice(e.target.value)}
                    placeholder="Để trống nếu giữ nguyên"
                  />
                  <Input
                    label="Ghi Chú Nhập Thêm"
                    placeholder="VD: Mua thêm từ đại lý..."
                    value={addNotes}
                    onChange={(e) => setAddNotes(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                    Hủy Bỏ
                  </Button>
                  <Button type="submit" variant="primary" style={{ background: '#15803d', borderColor: '#15803d' }}>
                    Xác Nhận Nhập
                  </Button>
                </div>
              </form>
            )}

            {/* Mode 3: XUẤT DÙNG */}
            {editMode === 'use' && (
              <form onSubmit={handleConfirmUseInEditModal} className="modal-form">
                <div className="inventory-stock-preview preview-use">
                  <div>
                    <span className="preview-label" style={{ color: '#92400e' }}>Tồn kho hiện có:</span>
                    <div className="preview-val" style={{ color: '#b45309' }}>
                      {editingItem.quantity} {editingItem.unit}
                    </div>
                  </div>
                  <div className="preview-arrow" style={{ color: '#d97706' }}>→</div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="preview-label" style={{ color: '#92400e' }}>Thành tiền chi phí:</span>
                    <div className="preview-val preview-val-cost">
                      {formatVND(Math.max(0, Number(useQuantity) || 0) * (editingItem.unitPrice || 0))}
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <Input
                    label={`Số Lượng Xuất Dùng (${editingItem.unit})`}
                    type="number"
                    min="0.1"
                    step="any"
                    max={editingItem.quantity}
                    value={useQuantity}
                    onChange={(e) => setUseQuantity(e.target.value)}
                    placeholder="VD: 1, 2..."
                    required
                  />
                  <Input
                    label="Ngày Sử Dụng"
                    type="date"
                    value={useDate}
                    onChange={(e) => setUseDate(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Ghi Chú Sử Dụng"
                  placeholder="VD: Cho đàn heo ăn ca sáng, tiêm phòng..."
                  value={useNotes}
                  onChange={(e) => setUseNotes(e.target.value)}
                />

                <div className="modal-actions">
                  <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                    Hủy Bỏ
                  </Button>
                  <Button type="submit" variant="primary" style={{ background: '#d97706', borderColor: '#d97706' }}>
                    Xác Nhận Xuất
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

