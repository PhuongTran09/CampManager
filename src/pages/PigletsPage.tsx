import React, { useState, useMemo, useEffect } from 'react';
import type { PigletBatch, PigletSaleRecord } from '../types';
import { Button, Input, Dropdown, Pagination, toast } from '../components/common';
import { formatDateVN } from '../utils';

const PAGE_SIZE = 6;

interface PigletsPageProps {
  batches: PigletBatch[];
  onUpdateBatch: (updatedBatch: PigletBatch) => void;
}

export const PigletsPage: React.FC<PigletsPageProps> = ({
  batches,
  onUpdateBatch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal Xuất bán
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedBatchForSale, setSelectedBatchForSale] = useState<PigletBatch | null>(null);

  // Form State Xuất bán
  const [saleType, setSaleType] = useState<'pair' | 'single' | 'all'>('pair');
  const [pairCount, setPairCount] = useState<number>(1);
  const [pricePerPair, setPricePerPair] = useState<number>(2400000);
  const [singleCount, setSingleCount] = useState<number>(1);
  const [pricePerPig, setPricePerPig] = useState<number>(1200000);
  const [buyerName, setBuyerName] = useState<string>('');
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Modal xem lịch sử bán nhiều mối
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedBatchHistory, setSelectedBatchHistory] = useState<PigletBatch | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const filteredBatches = batches.filter((b) => {
    const matchSearch =
      b.batchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.sowRfid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.sowName && b.sowName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      b.penCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.buyerName && b.buyerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.salesHistory && b.salesHistory.some(s => s.buyerName.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const paginatedBatches = useMemo(() => {
    return filteredBatches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredBatches, currentPage]);

  // Status Change (vd: chuyển tách mẹ)
  const handleStatusChange = (batch: PigletBatch, nextStatus: PigletBatch['status']) => {
    onUpdateBatch({
      ...batch,
      status: nextStatus,
      weanDate: nextStatus === 'weaned' ? new Date().toISOString().split('T')[0] : batch.weanDate
    });
    toast.success(`Đã cập nhật trạng thái lứa ${batch.batchCode}!`);
  };

  // Open Sale Modal
  const handleOpenSaleModal = (batch: PigletBatch) => {
    setSelectedBatchForSale(batch);
    setSaleType('pair');
    setPairCount(Math.max(1, Math.floor(batch.totalCount / 2)));
    setSingleCount(1);
    setPricePerPair(2400000);
    setPricePerPig(1200000);
    setBuyerName('');
    setSaleDate(new Date().toISOString().split('T')[0]);
    setShowSaleModal(true);
  };

  // Tính toán số con và thành tiền
  const calculateSaleDetails = () => {
    if (!selectedBatchForSale) return { totalPigsSold: 0, totalPrice: 0 };

    if (saleType === 'pair') {
      const pairs = Number(pairCount) || 0;
      const unitP = Number(pricePerPair) || 0;
      return { totalPigsSold: pairs * 2, totalPrice: pairs * unitP };
    } else if (saleType === 'single') {
      const singles = Number(singleCount) || 0;
      const unitP = Number(pricePerPig) || 0;
      return { totalPigsSold: singles, totalPrice: singles * unitP };
    } else {
      // Bán hết cả lứa theo đơn giá 1 con
      const pigs = selectedBatchForSale.totalCount;
      const unitP = Number(pricePerPig) || 0;
      const total = pigs * unitP;
      return { totalPigsSold: pigs, totalPrice: total };
    }
  };

  const handleConfirmSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForSale) return;

    const { totalPigsSold, totalPrice } = calculateSaleDetails();

    if (totalPigsSold <= 0) {
      toast.warning('Vui lòng nhập số lượng heo bán lớn hơn 0.');
      return;
    }

    if (totalPigsSold > selectedBatchForSale.totalCount) {
      toast.error(`Số lượng heo xuất bán (${totalPigsSold} con) vượt quá số heo hiện có (${selectedBatchForSale.totalCount} con)!`);
      return;
    }

    const newSaleRecord: PigletSaleRecord = {
      id: 'SALE-' + Date.now(),
      saleType,
      pairCount: saleType === 'pair' ? Number(pairCount) : undefined,
      pricePerPair: saleType === 'pair' ? Number(pricePerPair) : undefined,
      singleCount: saleType === 'single' ? Number(singleCount) : saleType === 'all' ? selectedBatchForSale.totalCount : undefined,
      pricePerPig: saleType !== 'pair' ? Number(pricePerPig) : undefined,
      totalSoldPigs: totalPigsSold,
      totalPrice,
      buyerName: buyerName.trim() || 'Thương lái lẻ',
      saleDate
    };

    const updatedHistory = [...(selectedBatchForSale.salesHistory || []), newSaleRecord];
    const remainingCount = selectedBatchForSale.totalCount - totalPigsSold;
    const totalSoldQtySoFar = (selectedBatchForSale.soldQuantity || 0) + totalPigsSold;
    const totalRevenueSoFar = (selectedBatchForSale.salePrice || 0) + totalPrice;
    const isSoldOut = remainingCount <= 0;

    const updatedBatch: PigletBatch = {
      ...selectedBatchForSale,
      totalCount: remainingCount,
      status: isSoldOut ? 'sold' : 'weaned',
      soldQuantity: totalSoldQtySoFar,
      salePrice: totalRevenueSoFar,
      buyerName: buyerName.trim() || 'Thương lái lẻ',
      saleDate,
      salesHistory: updatedHistory
    };

    onUpdateBatch(updatedBatch);
    setShowSaleModal(false);
    setSelectedBatchForSale(null);
    toast.success(`Đã ghi nhận xuất bán ${totalPigsSold} con heo thành công!`);
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (st: PigletBatch['status']) => {
    switch (st) {
      case 'nursing':
        return <span className="status-pill status-active">Đang Theo Mẹ</span>;
      case 'weaned':
        return <span className="status-pill" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>Đã Tách Mẹ</span>;
      case 'transferred':
        return <span className="status-pill" style={{ background: '#f3e8ff', color: '#7e22ce', fontWeight: 700 }}>Đã Chuyển Chuồng Thịt</span>;
      case 'sold':
        return <span className="status-pill" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>Đã Xuất Bán Hết</span>;
      default:
        return <span className="status-pill status-active">Bình Thường</span>;
    }
  };

  const renderSaleSummary = (b: PigletBatch) => {
    const history = b.salesHistory || [];
    if (history.length === 0 && !b.buyerName) {
      return <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Chưa bán đợt nào</span>;
    }

    return (
      <div style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
        <div><strong>Mối bán gần nhất:</strong> {b.buyerName}</div>
        <div>
          <strong>Đã bán:</strong> <span style={{ color: '#15803d', fontWeight: 700 }}>{b.soldQuantity || 0} con</span>
          {b.salePrice ? ` (${formatVND(b.salePrice)})` : ''}
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setSelectedBatchHistory(b);
              setShowHistoryModal(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#0284c7',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: 0,
              fontSize: '0.75rem',
              marginTop: '0.2rem',
              fontWeight: 600
            }}
          >
            Xem lịch sử ({history.length} mối/đợt)
          </button>
        )}
      </div>
    );
  };

  const { totalPigsSold, totalPrice } = calculateSaleDetails();

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div>
          <h1 className="custom-title-h2">Quản Lý Lứa Heo Con (Đã Tách Mẹ)</h1>
          <p className="custom-subtitle">
            Theo dõi danh sách các lứa heo con đã tách mẹ, xuất bán cho nhiều mối (bán cặp, bán lẻ, bán hết lứa).
          </p>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <Input
            placeholder="Tìm theo Mã lứa, Tên nái mẹ, Chuồng, Thương lái..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ width: '200px' }}>
          <Dropdown
            options={[
              { label: 'Tất cả trạng thái', value: 'all' },
              { label: 'Đang theo mẹ', value: 'nursing' },
              { label: 'Đã tách mẹ (Còn heo)', value: 'weaned' },
              { label: 'Đã chuyển chuồng', value: 'transferred' },
              { label: 'Đã xuất bán hết', value: 'sold' }
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Batches Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Tên nái mẹ</th>
              <th>Ngày Sinh</th>
              <th>Số Lượng Ban Đầu</th>
              <th>Số Lượng Còn Lại</th>
              <th>Ngày Tách Mẹ</th>
              <th>Thông Tin Bán / Mối Mua</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredBatches.length > 0 ? (
              paginatedBatches.map((b) => {
                const initial = b.initialCount || (b.totalCount + (b.soldQuantity || 0));
                return (
                  <tr key={b.id}>
                    <td>
                      <span className="sow-tag-highlight" style={{ fontSize: '0.85rem' }}>
                        {b.sowName || b.sowRfid}
                      </span>
                    </td>
                    <td>{formatDateVN(b.birthDate)}</td>
                    <td>
                      <strong style={{ color: '#0369a1' }}>{initial} con</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ({b.maleCount} đực, {b.femaleCount} cái)
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: b.totalCount > 0 ? 'var(--primary)' : '#64748b' }}>
                        {b.totalCount} con
                      </strong>
                    </td>
                    <td><strong>{b.weanDate ? formatDateVN(b.weanDate) : 'Chưa tách'}</strong></td>
                    <td>{renderSaleSummary(b)}</td>
                    <td>{getStatusBadge(b.status)}</td>
                    <td>
                      {b.status === 'nursing' && (
                        <Button
                          variant="secondary"
                          onClick={() => handleStatusChange(b, 'weaned')}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          Chuyển Tách Mẹ
                        </Button>
                      )}
                      {b.status === 'weaned' && b.totalCount > 0 && (
                        <Button
                          variant="primary"
                          onClick={() => handleOpenSaleModal(b)}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          Xuất Bán Heo
                        </Button>
                      )}
                      {b.status === 'sold' && (
                        <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>✓ Đã Bán Hết Lứa</span>
                      )}
                      {b.status === 'transferred' && (
                        <span style={{ fontSize: '0.75rem', color: '#7e22ce', fontWeight: 700 }}>✓ Đã Chuyển Đàn</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Chưa có thông tin lứa heo con.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredBatches.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />

      {/* Modal Xuất Bán Heo Con */}
      {showSaleModal && selectedBatchForSale && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Ghi Nhận Xuất Bán Heo Con / Giống</h3>
              <button type="button" className="modal-close" onClick={() => setShowSaleModal(false)}>×</button>
            </div>
            <form onSubmit={handleConfirmSale}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <div><strong>Mã lứa:</strong> {selectedBatchForSale.batchCode} (Nái mẹ: {selectedBatchForSale.sowName || selectedBatchForSale.sowRfid})</div>
                  <div><strong>Số heo hiện còn trong lứa:</strong> <span style={{ color: '#0284c7', fontWeight: 700 }}>{selectedBatchForSale.totalCount} con</span></div>
                  {selectedBatchForSale.soldQuantity ? (
                    <div style={{ color: '#16a34a', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      Đã bán trước đó: {selectedBatchForSale.soldQuantity} con cho {selectedBatchForSale.salesHistory?.length || 1} mối
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="form-label">Phương thức xuất bán</label>
                  <Dropdown
                    options={[
                      { label: 'Bán theo cặp (Bán cặp)', value: 'pair' },
                      { label: 'Bán lẻ / theo con (Bán đơn)', value: 'single' },
                      { label: 'Bán hết lứa còn lại', value: 'all' }
                    ]}
                    value={saleType}
                    onChange={(e) => {
                      const type = e.target.value as 'pair' | 'single' | 'all';
                      setSaleType(type);
                    }}
                  />
                </div>

                <div>
                  <label className="form-label">Tên mối mua / Thương lái</label>
                  <Input
                    placeholder="VD: Anh Tám (Mối Chợ Vó), Chị Hoa, Mối Giống..."
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                  />
                </div>

                {/* Chi tiết theo phương thức bán */}
                {saleType === 'pair' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f0f9ff', padding: '0.75rem', borderRadius: '8px' }}>
                    <div>
                      <label className="form-label">Số cặp bán</label>
                      <Input
                        type="number"
                        min={1}
                        max={Math.floor(selectedBatchForSale.totalCount / 2) || 1}
                        value={pairCount}
                        onChange={(e) => setPairCount(Number(e.target.value))}
                        required
                      />
                      <div style={{ fontSize: '0.75rem', color: '#0369a1', marginTop: '0.2rem' }}>
                        = {Number(pairCount) * 2} con heo
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Giá bán 1 Cặp (VNĐ)</label>
                      <Input
                        type="number"
                        placeholder="VD: 3000000"
                        value={pricePerPair || ''}
                        onChange={(e) => setPricePerPair(Number(e.target.value))}
                        required
                      />
                      {pricePerPair > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                          (~{formatVND(pricePerPair / 2)}/con)
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {saleType === 'single' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f0f9ff', padding: '0.75rem', borderRadius: '8px' }}>
                    <div>
                      <label className="form-label">Số con bán</label>
                      <Input
                        type="number"
                        min={1}
                        max={selectedBatchForSale.totalCount}
                        value={singleCount}
                        onChange={(e) => setSingleCount(Number(e.target.value))}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Giá bán 1 Con (VNĐ)</label>
                      <Input
                        type="number"
                        placeholder="VD: 1500000"
                        value={pricePerPig || ''}
                        onChange={(e) => setPricePerPig(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                )}

                {saleType === 'all' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f0f9ff', padding: '0.75rem', borderRadius: '8px' }}>
                    <div>
                      <label className="form-label">Số con bán hết</label>
                      <Input
                        type="number"
                        value={selectedBatchForSale.totalCount}
                        disabled
                      />
                      <div style={{ fontSize: '0.75rem', color: '#0369a1', marginTop: '0.2rem' }}>
                        (Bán toàn bộ {selectedBatchForSale.totalCount} con còn lại)
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Giá bán lẻ 1 Con (VNĐ)</label>
                      <Input
                        type="number"
                        placeholder="VD: 1450000"
                        value={pricePerPig || ''}
                        onChange={(e) => setPricePerPig(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Ngày xuất bán</label>
                    <Input
                      type="date"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Tổng heo xuất đợt này</label>
                    <div style={{ padding: '0.5rem', background: '#f1f5f9', borderRadius: '6px', fontWeight: 700, fontSize: '0.9rem' }}>
                      {totalPigsSold} con
                    </div>
                  </div>
                </div>

                <div style={{ background: '#ecfdf5', padding: '0.85rem', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#047857' }}>Tổng Thành Tiền Đợt Này:</div>
                  <div style={{ fontSize: '1.25rem', color: '#15803d', fontWeight: 800 }}>
                    {formatVND(totalPrice)}
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button type="button" variant="outline" onClick={() => setShowSaleModal(false)}>
                  Hủy Bỏ
                </Button>
                <Button type="submit" variant="primary">
                  Xác Nhận Xuất Bán
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Lịch Sử Xuất Bán Nhiều Mối */}
      {showHistoryModal && selectedBatchHistory && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Lịch Sử Xuất Bán - Lứa {selectedBatchHistory.batchCode}</h3>
              <button type="button" className="modal-close" onClick={() => setShowHistoryModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div><strong>Mã lứa:</strong> {selectedBatchHistory.batchCode} | <strong>Nái mẹ:</strong> {selectedBatchHistory.sowName || selectedBatchHistory.sowRfid}</div>
                <div><strong>Tổng số đã bán:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>{selectedBatchHistory.soldQuantity || 0} con</span></div>
                <div><strong>Tổng doanh thu lứa này:</strong> <span style={{ color: '#15803d', fontWeight: 700 }}>{formatVND(selectedBatchHistory.salePrice || 0)}</span></div>
                <div><strong>Số heo còn lại hiện tại:</strong> {selectedBatchHistory.totalCount} con</div>
              </div>

              <div className="table-responsive">
                <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Ngày Bán</th>
                      <th>Thương Lái / Mối Mua</th>
                      <th>Hình Thức</th>
                      <th>Số Lượng Bán</th>
                      <th>Đơn Giá</th>
                      <th>Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBatchHistory.salesHistory && selectedBatchHistory.salesHistory.length > 0 ? (
                      selectedBatchHistory.salesHistory.map((rec) => (
                        <tr key={rec.id}>
                          <td>{formatDateVN(rec.saleDate)}</td>
                          <td><strong>{rec.buyerName}</strong></td>
                          <td>
                            {rec.saleType === 'pair' ? (
                              <span style={{ color: '#0284c7', fontWeight: 600 }}>Bán {rec.pairCount} cặp</span>
                            ) : rec.saleType === 'single' ? (
                              <span style={{ color: '#0d9488', fontWeight: 600 }}>Bán lẻ ({rec.singleCount} con)</span>
                            ) : (
                              <span style={{ color: '#7e22ce', fontWeight: 600 }}>Bán hết lứa ({rec.singleCount} con)</span>
                            )}
                          </td>
                          <td><strong>{rec.totalSoldPigs} con</strong></td>
                          <td>
                            {rec.saleType === 'pair' ? (
                              <div>{formatVND(rec.pricePerPair || 0)}/cặp</div>
                            ) : (
                              <div>{formatVND(rec.pricePerPig || 0)}/con</div>
                            )}
                          </td>
                          <td><strong style={{ color: '#15803d' }}>{formatVND(rec.totalPrice)}</strong></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>
                          Chưa có ghi nhận lịch sử bán.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="button" variant="outline" onClick={() => setShowHistoryModal(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


