import React, { useState, useEffect } from 'react';
import type { Sow, BreedingRecord, FarrowingRecord } from '../types';
import { Button, Input, DatePicker, Dropdown } from '../components/common';
import { formatDateVN } from '../utils';

interface SowProfilePageProps {
  sows: Sow[];
  onAddSow: (newSow: Sow) => void;
  onUpdateSow: (updatedSow: Sow) => void;
}

export const SowProfilePage: React.FC<SowProfilePageProps> = ({
  sows,
  onAddSow,
  onUpdateSow
}) => {
  const [selectedSow, setSelectedSow] = useState<Sow | null>(sows[0] || null);
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'breeding' | 'farrowing' | 'vaccines'>('info');

  // Pagination for Farrowing History (3 items per page)
  const [farrowingPage, setFarrowingPage] = useState(1);
  const FARROWING_PER_PAGE = 3;

  useEffect(() => {
    setFarrowingPage(1);
  }, [selectedSow?.id]);

  // Modal States
  const [showAddSowModal, setShowAddSowModal] = useState(false);
  const [showBreedingModal, setShowBreedingModal] = useState(false);
  const [showFarrowingModal, setShowFarrowingModal] = useState(false);
  const [showSowListMenu, setShowSowListMenu] = useState(false);

  // New Sow Form State
  const [rfidTag, setRfidTag] = useState('');
  const [breed, setBreed] = useState('Landrace');
  const [birthDate, setBirthDate] = useState('');
  const [penCode, setPenCode] = useState('CH-A1');

  // Breeding Form State
  const [breedingDate, setBreedingDate] = useState('');
  const [method, setMethod] = useState<'artificial' | 'natural'>('artificial');
  const [boarCode, setBoarCode] = useState('');
  const [technician, setTechnician] = useState('');
  const [timesCount] = useState('2');

  // Farrowing Form State
  const [farrowingDate, setFarrowingDate] = useState('');
  const [bornAlive, setBornAlive] = useState('12');
  const [stillborn, setStillborn] = useState('0');
  const [mummified, setMummified] = useState('0');
  const [totalBornWeightKg, setTotalBornWeightKg] = useState('16.5');

  // Cai sữa state
  const [weanedCount, setWeanedCount] = useState('11');
  const [weanedWeightKg] = useState('75');


  // Filter Search
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSows = sows.filter(
    (s) =>
      s.rfidTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.penCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto calculate expected farrowing date (+114 days)
  const calculateExpectedDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 114);
    return d.toISOString().split('T')[0];
  };

  // Create Sow
  const handleCreateSow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidTag) return;

    const newSow: Sow = {
      id: `sow-${Date.now()}`,
      rfidTag,
      breed,
      birthDate: birthDate || '2024-01-01',
      penCode,
      currentParity: 0,
      status: 'waiting',
      healthStatus: 'healthy',
      breedingHistory: [],
      farrowingHistory: [],
      vaccines: [
        {
          id: `v-${Date.now()}-1`,
          vaccineName: 'Vắc xin Khô thai (Parvovirus)',
          scheduledDate: '2026-10-01',
          status: 'pending'
        },
        {
          id: `v-${Date.now()}-2`,
          vaccineName: 'Vắc xin Tai xanh (PRRS)',
          scheduledDate: '2026-10-15',
          status: 'pending'
        }
      ]
    };

    onAddSow(newSow);
    setSelectedSow(newSow);
    setShowAddSowModal(false);
    setRfidTag('');
  };

  // Add Breeding Record
  const handleAddBreeding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSow || !breedingDate) return;

    const expectedFarrowDate = calculateExpectedDate(breedingDate);

    const newRecord: BreedingRecord = {
      id: `b-${Date.now()}`,
      breedingDate,
      method,
      boarCode: boarCode || 'DUC-99 (Duroc)',
      technician: technician || 'KTV Trang Trại',
      timesCount: Number(timesCount) || 2,
      ultrasoundDay21: 'pending',
      ultrasoundDay60: 'pending',
      expectedFarrowDate,
      status: 'in_gestation'
    };

    const updatedSow: Sow = {
      ...selectedSow,
      status: 'in_gestation',
      breedingHistory: [newRecord, ...selectedSow.breedingHistory]
    };

    onUpdateSow(updatedSow);
    setSelectedSow(updatedSow);
    setShowBreedingModal(false);
  };

  // Add Farrowing Record
  const handleAddFarrowing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSow || !farrowingDate) return;

    const newParity = selectedSow.currentParity + 1;

    const newRecord: FarrowingRecord = {
      id: `f-${Date.now()}`,
      parityNumber: newParity,
      farrowingDate,
      bornAlive: Number(bornAlive) || 0,
      stillborn: Number(stillborn) || 0,
      mummified: Number(mummified) || 0,
      totalBornWeightKg: Number(totalBornWeightKg) || 0
    };

    const updatedSow: Sow = {
      ...selectedSow,
      currentParity: newParity,
      status: 'farrowing',
      farrowingHistory: [newRecord, ...selectedSow.farrowingHistory]
    };

    onUpdateSow(updatedSow);
    setSelectedSow(updatedSow);
    setShowFarrowingModal(false);
  };

  // Cai sữa & Tách đàn
  const handleWeanPigs = (farrowId: string) => {
    if (!selectedSow) return;

    const updatedFarrowingHistory = selectedSow.farrowingHistory.map((f) => {
      if (f.id === farrowId) {
        return {
          ...f,
          weanedCount: Number(weanedCount) || 10,
          weanedWeightKg: Number(weanedWeightKg) || 70,
          weanDate: new Date().toLocaleDateString('vi-VN')
        };
      }
      return f;
    });

    const updatedSow: Sow = {
      ...selectedSow,
      status: 'waiting', // Đưa heo mẹ về trạng thái chờ phối lứa tiếp theo
      farrowingHistory: updatedFarrowingHistory
    };

    onUpdateSow(updatedSow);
    setSelectedSow(updatedSow);
    alert('Đã thực hiện cai sữa & tách đàn thành công! Heo mẹ đã được đưa về trạng thái "Chờ Phối Giống".');
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'in_gestation':
        return <span className="status-pill" style={{ background: '#fef3c7', color: '#b45309' }}>Đang Mang Thai</span>;
      case 'farrowing':
      case 'nursing':
        return <span className="status-pill status-active">Đang Đẻ / Bú Sữa</span>;
      case 'weaned':
        return <span className="status-pill" style={{ background: '#e0f2fe', color: '#0369a1' }}>Đã Cai Sữa</span>;
      case 'waiting':
        return <span className="status-pill" style={{ background: '#f3e8ff', color: '#7e22ce' }}>Chờ Phối Giống</span>;
      default:
        return <span className="status-pill status-active">Bình Thường</span>;
    }
  };

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div>
          <h1 className="custom-title-h2">Quản Lý Hồ Sơ Heo Nái</h1>
          <p className="custom-subtitle">
            Theo dõi RFID/Thẻ tai, chu kỳ phối giống, thai kỳ (dự báo ngày đẻ), đỡ đẻ & lịch tiêm phòng vắc xin.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowAddSowModal(true)}>
          + Thêm Heo Nái Mới
        </Button>
      </div>

      {/* Sow List Menu Button (Web & Mobile) */}
      <div className="sow-toggle-bar">
        <button
          type="button"
          className="sow-menu-btn"
          onClick={() => setShowSowListMenu(!showSowListMenu)}
        >
          <span>Danh Sách Heo Nái ({filteredSows.length})</span>
          <span>{selectedSow ? `Đang chọn: ${selectedSow.rfidTag}` : 'Chọn nái...'} ▾</span>
        </button>
      </div>

      {/* Main Grid View */}
      <div className="sow-profile-layout">
        {/* Backdrop overlay */}
        {showSowListMenu && (
          <div
            className="sow-sidebar-backdrop"
            onClick={() => setShowSowListMenu(false)}
          />
        )}

        {/* Sidebar: List of Sows (Dropdown / Modal) */}
        <div className={`sow-sidebar-card ${showSowListMenu ? 'open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
              Danh Sách Heo Nái ({filteredSows.length})
            </h3>
            <button
              type="button"
              className="mobile-close-sidebar-btn"
              onClick={() => setShowSowListMenu(false)}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#64748b'
              }}
            >
              ✕
            </button>
          </div>

          <Input
            placeholder="Tìm Mã RFID/Thẻ tai..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />

          <div className="sow-list-container">
            {filteredSows.map((sow) => (
              <div
                key={sow.id}
                onClick={() => {
                  setSelectedSow(sow);
                  setActiveSubTab('info');
                  setShowSowListMenu(false);
                }}
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedSow?.id === sow.id ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                  background: selectedSow?.id === sow.id ? '#eff6ff' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>{sow.rfidTag}</strong>
                  <span className="camp-tag">Chuồng {sow.penCode}</span>
                </div>
                <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '0.35rem' }}>
                  Giống: <strong>{sow.breed}</strong> | Lứa: <strong>{sow.currentParity}</strong>
                </div>
                <div style={{ marginTop: '0.5rem' }}>{getStatusBadge(sow.status)}</div>
              </div>
            ))}
          </div>
        </div>


        {/* Right Detail Pane */}
        {selectedSow ? (
          <div className="sow-detail-pane container-fade-in">
            {/* Top Detail Header */}
            <div className="sow-detail-header container-fade-in">
              <div className="sow-header-top">
                <div className="sow-title-group">
                  <div>
                    <h2 className="sow-header-title">
                      Hồ Sơ Nái: <span className="sow-tag-highlight">{selectedSow.rfidTag}</span>
                    </h2>
                    <span className="sow-pen-badge">Vị trí: Chuồng {selectedSow.penCode}</span>
                  </div>
                </div>
                <div className="sow-header-status-box">
                  {getStatusBadge(selectedSow.status)}
                  <span className="sow-parity-pill">
                    Đã trải qua: <strong>{selectedSow.currentParity} lứa đẻ</strong>
                  </span>
                </div>
              </div>

              <div className="sow-header-meta-grid">
                <div className="sow-meta-chip">
                  <span className="meta-chip-label">Giống heo:</span>
                  <span className="meta-chip-val">{selectedSow.breed}</span>
                </div>
                <div className="sow-meta-chip">
                  <span className="meta-chip-label">Ngày sinh:</span>
                  <span className="meta-chip-val">{formatDateVN(selectedSow.birthDate)}</span>
                </div>
                <div className="sow-meta-chip">
                  <span className="meta-chip-label">Trạng thái chu kỳ:</span>
                  <span className="meta-chip-val">Lứa đẻ #{selectedSow.currentParity}</span>
                </div>
              </div>
            </div>

            {/* Sub Tabs Navigation */}
            <div className="sub-tabs-wrapper">
              <button
                className={`auth-tab ${activeSubTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('info')}
              >
                Thông Tin Chung
              </button>
              <button
                className={`auth-tab ${activeSubTab === 'breeding' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('breeding')}
              >
                Phối Giống & Thai Kỳ
              </button>
              <button
                className={`auth-tab ${activeSubTab === 'farrowing' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('farrowing')}
              >
                Đỡ Đẻ & Cai Sữa
              </button>
              <button
                className={`auth-tab ${activeSubTab === 'vaccines' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('vaccines')}
              >
                Lịch Tiêm Phòng
              </button>
            </div>

            {/* Sub Tab Content 1: GENERAL INFO */}
            {activeSubTab === 'info' && (
              <div className="container-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div className="stat-cards-grid">
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Tổng Số Con Sinh Ra (Các Lứa)</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.2rem' }}>
                      {selectedSow.farrowingHistory.reduce((acc, f) => acc + f.bornAlive, 0)} con
                    </h3>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Tỷ Lệ Con Sống Trúng Tuyển</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>
                      {selectedSow.farrowingHistory.length > 0
                        ? (
                            (selectedSow.farrowingHistory.reduce((acc, f) => acc + f.bornAlive, 0) /
                              selectedSow.farrowingHistory.reduce((acc, f) => acc + f.bornAlive + f.stillborn + f.mummified, 0)) *
                            100
                          ).toFixed(1) + '%'
                        : '100%'}
                    </h3>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Trọng Lượng Cai Sữa Trung Bình</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7', marginTop: '0.2rem' }}>
                      7.2 kg / con
                    </h3>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ghi chú đặc điểm nái:</h4>
                  <p style={{ fontSize: '0.875rem', color: '#475569' }}>{selectedSow.notes || 'Chưa có ghi chú bổ sung.'}</p>
                </div>
              </div>
            )}

            {/* Sub Tab Content 2: BREEDING & PREGNANCY */}
            {activeSubTab === 'breeding' && (
              <div className="container-fade-in" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Lịch Sử Chu Kỳ Phối Giống & Siêu Âm Thai</h4>
                  <Button variant="primary" onClick={() => setShowBreedingModal(true)}>
                    + Thêm Phối Giống Lứa Mới
                  </Button>
                </div>

                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Ngày Phối</th>
                        <th>Phương Pháp & Nguồn Tinh</th>
                        <th>Người Phối</th>
                        <th>Khám Thai (Ngày 21–25)</th>
                        <th>Khám Thai (Ngày 60)</th>
                        <th>Ngày Dự Sinh (+114 ngày)</th>
                        <th>Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSow.breedingHistory.length > 0 ? (
                        selectedSow.breedingHistory.map((b) => (
                          <tr key={b.id}>
                            <td><strong>{formatDateVN(b.breedingDate)}</strong></td>
                            <td>
                              <div>{b.method === 'artificial' ? 'Thụ tinh nhân tạo' : 'Phối tự nhiên'}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Tinh: {b.boarCode}</div>
                            </td>
                            <td>{b.technician} ({b.timesCount} lần)</td>
                            <td>
                              <span className="status-pill status-active">Đã đậu thai</span>
                            </td>
                            <td>
                              <span className="status-pill status-active">Thai khỏe mạnh</span>
                            </td>
                            <td>
                              <strong style={{ color: '#dc2626' }}>{formatDateVN(b.expectedFarrowDate)}</strong>
                            </td>
                            <td>
                              <span className="camp-tag">{b.status === 'in_gestation' ? 'Đang mang thai' : 'Đã đẻ'}</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                            Chưa có dữ liệu phối giống.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub Tab Content 3: FARROWING & NURSING */}
            {activeSubTab === 'farrowing' && (
              <div className="container-fade-in" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Lịch Sử Đỡ Đẻ, Số Con & Cai Sữa</h4>
                  <Button variant="primary" onClick={() => setShowFarrowingModal(true)}>
                    + Ghi Nhận Lứa Đẻ Mới
                  </Button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedSow.farrowingHistory.length > 0 ? (
                    <>
                      {selectedSow.farrowingHistory
                        .slice((farrowingPage - 1) * FARROWING_PER_PAGE, farrowingPage * FARROWING_PER_PAGE)
                        .map((f) => (
                          <div key={f.id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div className="farrowing-header-row">
                              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                                Lứa Đẻ Thứ #{f.parityNumber} (Ngày: {formatDateVN(f.farrowingDate)})
                              </h4>
                              {!f.weanDate || typeof f.weanDate === 'string' && f.weanDate.includes('Đang') ? (
                                <div className="wean-action-group">
                                  <Input
                                    placeholder="Số con cai sữa..."
                                    value={weanedCount}
                                    onChange={(e) => setWeanedCount(e.target.value)}
                                    style={{ width: '130px' }}
                                  />
                                  <Button variant="secondary" onClick={() => handleWeanPigs(f.id)}>
                                    Cai Sữa & Tách Đàn
                                  </Button>
                                </div>
                              ) : (
                                <span className="status-pill status-active">Đã Cai Sữa ({formatDateVN(String(f.weanDate))})</span>
                              )}
                            </div>

                            <div className="farrowing-stat-grid">
                              <div>Con sống: <strong style={{ color: '#16a34a' }}>{f.bornAlive} con</strong></div>
                              <div>Chết lưu: <strong>{f.stillborn} con</strong></div>
                              <div>Dị tật/chết non: <strong>{f.mummified} con</strong></div>
                              <div>Trọng lượng sơ sinh: <strong>{f.totalBornWeightKg} kg</strong></div>
                            </div>

                            {f.deathReasonSummary && (
                              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#c2410c' }}>
                                Nguyên nhân rủi ro: {f.deathReasonSummary}
                              </div>
                            )}
                          </div>
                        ))}

                      {/* Pagination Controls */}
                      {Math.ceil(selectedSow.farrowingHistory.length / FARROWING_PER_PAGE) > 1 && (
                        <div className="pagination-bar">
                          <button
                            type="button"
                            className="pagination-btn"
                            disabled={farrowingPage === 1}
                            onClick={() => setFarrowingPage((p) => Math.max(1, p - 1))}
                          >
                            ‹ Trang trước
                          </button>
                          <span className="pagination-info">
                            Trang {farrowingPage} / {Math.ceil(selectedSow.farrowingHistory.length / FARROWING_PER_PAGE)} (Tổng {selectedSow.farrowingHistory.length} lứa)
                          </span>
                          <button
                            type="button"
                            className="pagination-btn"
                            disabled={farrowingPage === Math.ceil(selectedSow.farrowingHistory.length / FARROWING_PER_PAGE)}
                            onClick={() => setFarrowingPage((p) => Math.min(Math.ceil(selectedSow.farrowingHistory.length / FARROWING_PER_PAGE), p + 1))}
                          >
                            Trang sau ›
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                      Chưa có lịch sử đỡ đẻ.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sub Tab Content 4: VACCINES */}
            {activeSubTab === 'vaccines' && (
              <div className="container-fade-in" style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Lịch Tiêm Phòng Vắc Xin Theo Tuổi Thai</h4>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Tên Vắc Xin / Kháng Thể</th>
                        <th>Ngày Hẹn Tiêm</th>
                        <th>Ngày Đã Tiêm Thực Tế</th>
                        <th>Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSow.vaccines.map((v) => (
                        <tr key={v.id}>
                          <td><strong>{v.vaccineName}</strong></td>
                          <td>{formatDateVN(v.scheduledDate)}</td>
                          <td>{v.administeredDate ? formatDateVN(v.administeredDate) : '---'}</td>
                          <td>
                            <span className={`status-pill status-${v.status === 'done' ? 'active' : 'pending'}`}>
                              {v.status === 'done' ? 'Đã tiêm phòng' : 'Chờ đến ngày tiêm'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            Vui lòng chọn một heo nái từ danh sách bên trái để xem thông tin chi tiết.
          </div>
        )}
      </div>

      {/* Add Sow Modal */}
      {showAddSowModal && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in">
            <div className="modal-header">
              <h3>Thêm Heo Nái Mới (Định Danh RFID)</h3>
              <button className="close-btn" onClick={() => setShowAddSowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateSow} className="modal-form">
              <Input
                label="Mã Thẻ Tai / RFID"
                placeholder="VD: NAI-8805"
                value={rfidTag}
                onChange={(e) => setRfidTag(e.target.value)}
                required
              />
              <Dropdown
                label="Giống Heo Nái"
                options={[
                  { label: 'Landrace Thuần Chủng', value: 'Landrace' },
                  { label: 'Yorkshire Siêu Nái', value: 'Yorkshire' },
                  { label: 'Duroc Hậu Bị', value: 'Duroc' }
                ]}
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
              <DatePicker
                label="Ngày sinh heo nái"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
              <Dropdown
                label="Phân vào Chuồng"
                options={[
                  { label: 'Chuồng Nái Đẻ A1 (CH-A1)', value: 'CH-A1' },
                  { label: 'Chuồng Cai Sữa C1 (CH-C1)', value: 'CH-C1' }
                ]}
                value={penCode}
                onChange={(e) => setPenCode(e.target.value)}
              />

              <div className="modal-actions">
                <Button type="button" variant="outline" onClick={() => setShowAddSowModal(false)}>Hủy</Button>
                <Button type="submit" variant="primary">Lưu Hồ Sơ Nái</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Breeding Modal */}
      {showBreedingModal && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in">
            <div className="modal-header">
              <h3>Ghi Nhận Phối Giống (Giai Đoạn Lên Giống)</h3>
              <button className="close-btn" onClick={() => setShowBreedingModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddBreeding} className="modal-form">
              <DatePicker
                label="Ngày phối giống"
                value={breedingDate}
                onChange={(e) => setBreedingDate(e.target.value)}
                required
              />
              {breedingDate && (
                <div style={{ background: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: '#991b1b', fontWeight: 700 }}>
                  Dự báo ngày đẻ (+114 ngày): {calculateExpectedDate(breedingDate)}
                </div>
              )}

              <Dropdown
                label="Phương pháp phối"
                options={[
                  { label: 'Thụ tinh nhân tạo (AI)', value: 'artificial' },
                  { label: 'Phối nhảy tự nhiên', value: 'natural' }
                ]}
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
              />
              <Input
                label="Nguồn tinh / Mã heo đực"
                placeholder="VD: DUC-99 (Duroc Mỹ)"
                value={boarCode}
                onChange={(e) => setBoarCode(e.target.value)}
              />
              <Input
                label="Người thực hiện phối"
                placeholder="VD: KTV Hoàng"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
              />

              <div className="modal-actions">
                <Button type="button" variant="outline" onClick={() => setShowBreedingModal(false)}>Hủy</Button>
                <Button type="submit" variant="primary">Lưu Phối Giống</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Farrowing Modal */}
      {showFarrowingModal && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in">
            <div className="modal-header">
              <h3>Ghi Nhận Nhật Ký Đỡ Đẻ</h3>
              <button className="close-btn" onClick={() => setShowFarrowingModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddFarrowing} className="modal-form">
              <DatePicker
                label="Ngày đẻ thực tế"
                value={farrowingDate}
                onChange={(e) => setFarrowingDate(e.target.value)}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Input
                  label="Số con sống khỏe mạnh"
                  type="number"
                  value={bornAlive}
                  onChange={(e) => setBornAlive(e.target.value)}
                  required
                />
                <Input
                  label="Số con chết lưu"
                  type="number"
                  value={stillborn}
                  onChange={(e) => setStillborn(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Input
                  label="Số con mummified/dị tật"
                  type="number"
                  value={mummified}
                  onChange={(e) => setMummified(e.target.value)}
                />
                <Input
                  label="Tổng cân nặng sơ sinh (kg)"
                  type="number"
                  value={totalBornWeightKg}
                  onChange={(e) => setTotalBornWeightKg(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <Button type="button" variant="outline" onClick={() => setShowFarrowingModal(false)}>Hủy</Button>
                <Button type="submit" variant="primary">Xác Nhận Đỡ Đẻ</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
