import React, { useState, useEffect, useMemo } from 'react';
import type { Sow, BreedingRecord, FarrowingRecord, PigletBatch } from '../types';
import { Button, Input, DatePicker, Dropdown, Pagination } from '../components/common';
import { formatDateVN } from '../utils';

const PAGE_SIZE = 6;

interface SowProfilePageProps {
  sows: Sow[];
  onAddSow: (newSow: Sow) => void;
  onUpdateSow: (updatedSow: Sow) => void;
  onAddPigletBatch?: (newBatch: PigletBatch) => void;
}

export const SowProfilePage: React.FC<SowProfilePageProps> = ({
  sows,
  onAddSow,
  onUpdateSow,
  onAddPigletBatch
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
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showSowListMenu, setShowSowListMenu] = useState(false);

  // Vaccine Form State
  const [newVaccineType, setNewVaccineType] = useState<'vaccine' | 'treatment'>('vaccine');
  const [newVaccineName, setNewVaccineName] = useState('');
  const [newVaccineDate, setNewVaccineDate] = useState('');
  const [newVaccineDosage, setNewVaccineDosage] = useState('');
  const [newVaccineNotes, setNewVaccineNotes] = useState('');

  // New Sow Form State
  const [rfidTag, setRfidTag] = useState('');
  const [breed, setBreed] = useState('Landrace');
  const [birthDate, setBirthDate] = useState('');
  const [penCode, setPenCode] = useState('CH-A1');

  const getTodayStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  // Breeding Form State
  const [breedingDate, setBreedingDate] = useState(getTodayStr);
  const [method, setMethod] = useState<'artificial' | 'natural'>('artificial');
  const [boarCode, setBoarCode] = useState('');
  const [timesCount] = useState('2');

  // Farrowing Form State
  const [farrowingDate, setFarrowingDate] = useState(getTodayStr);
  const [bornAlive, setBornAlive] = useState('12');
  const [stillborn, setStillborn] = useState('0');
  const [mummified, setMummified] = useState('0');

  // Risk Reason Edit Modal State
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [editingFarrowId, setEditingFarrowId] = useState<string | null>(null);
  const [maleCount, setMaleCount] = useState<string>('');
  const [femaleCount, setFemaleCount] = useState<string>('');
  const [riskReason, setRiskReason] = useState('');

  // Sow Daily Note Edit Modal State
  const [showSowNoteModal, setShowSowNoteModal] = useState(false);
  const [noteDate, setNoteDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [noteTime, setNoteTime] = useState<string>(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
  const [sowNoteText, setSowNoteText] = useState('');
  // Notification Modal State
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);


  // Filter Search
  const [searchTerm, setSearchTerm] = useState('');
  const [sowPage, setSowPage] = useState(1);

  const filteredSows = sows.filter(
    (s) =>
      s.rfidTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.penCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setSowPage(1);
  }, [searchTerm]);

  const paginatedSows = useMemo(() => {
    return filteredSows.slice((sowPage - 1) * PAGE_SIZE, sowPage * PAGE_SIZE);
  }, [filteredSows, sowPage]);

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
      technician: 'KTV Trang Trại',
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

  // Đánh dấu không đậu thai (phối lại)
  const handleMarkBreedingFailed = (breedingId: string) => {
    if (!selectedSow) return;

    const updatedHistory = selectedSow.breedingHistory.map((b) => {
      if (b.id === breedingId) {
        return {
          ...b,
          ultrasoundDay21: 'not_pregnant' as const,
          status: 'failed' as const
        };
      }
      return b;
    });

    const updatedSow: Sow = {
      ...selectedSow,
      status: 'waiting', // Trở về trạng thái chờ phối lại
      breedingHistory: updatedHistory
    };

    onUpdateSow(updatedSow);
    setSelectedSow(updatedSow);
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
      totalBornWeightKg: 0
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

    const todayDateStr = new Date().toISOString().split('T')[0];
    let weanedRecord: FarrowingRecord | undefined;

    const updatedFarrowingHistory = selectedSow.farrowingHistory.map((f) => {
      if (f.id === farrowId) {
        weanedRecord = f;
        return {
          ...f,
          weanedCount: f.bornAlive || 10,
          weanedWeightKg: 70,
          weanDate: todayDateStr
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

    // Tự động tạo lứa heo con đã tách mẹ sang bên Quản Lý Lứa Heo Con
    if (onAddPigletBatch && weanedRecord) {
      const male = weanedRecord.maleCount || Math.floor((weanedRecord.bornAlive || 10) / 2);
      const female = weanedRecord.femaleCount || ((weanedRecord.bornAlive || 10) - male);

      const newPigletBatch: PigletBatch = {
        id: `pb-${Date.now()}`,
        batchCode: `LUA-${selectedSow.rfidTag}-L${weanedRecord.parityNumber}`,
        sowRfid: selectedSow.rfidTag,
        sowName: selectedSow.name || `Nái Mẹ ${selectedSow.rfidTag}`,
        birthDate: weanedRecord.farrowingDate,
        totalCount: weanedRecord.bornAlive || 10,
        maleCount: male,
        femaleCount: female,
        avgWeightKg: 7.0, // Trọng lượng trung bình lúc tách mẹ (~7kg)
        penCode: 'CH-C1', // Chuồng cai sữa mặc định
        weanDate: todayDateStr, // Ngày tách mẹ (lấy đồng bộ từ ngày cai sữa)
        status: 'weaned', // Trạng thái: Đã Tách Mẹ
        healthStatus: 'healthy',
        notes: `Lứa đẻ thứ #${weanedRecord.parityNumber} của nái ${selectedSow.name || selectedSow.rfidTag}`
      };
      onAddPigletBatch(newPigletBatch);
    }

    setNotificationMsg(`Đã thực hiện tách mẹ thành công! Lứa heo con đã được chuyển sang Quản Lý Lứa Heo Con (Mã: LUA-${selectedSow.rfidTag}-L${weanedRecord?.parityNumber || 1}) và nái mẹ về trạng thái "Chờ Phối Giống".`);
  };

  // Mở modal cập nhật số con đực/cái & ghi chú
  const handleOpenRiskModal = (farrowId: string, farrowRecord: FarrowingRecord) => {
    setEditingFarrowId(farrowId);
    setMaleCount(farrowRecord.maleCount !== undefined ? String(farrowRecord.maleCount) : '');
    setFemaleCount(farrowRecord.femaleCount !== undefined ? String(farrowRecord.femaleCount) : '');
    setRiskReason(farrowRecord.deathReasonSummary || '');
    setShowRiskModal(true);
  };

  // Lưu thông tin chỉnh sửa lứa đẻ (số đực, cái, ghi chú)
  const handleSaveRiskReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSow || !editingFarrowId) return;

    const updatedFarrowingHistory = selectedSow.farrowingHistory.map((f) => {
      if (f.id === editingFarrowId) {
        return {
          ...f,
          maleCount: maleCount !== '' ? Number(maleCount) : undefined,
          femaleCount: femaleCount !== '' ? Number(femaleCount) : undefined,
          deathReasonSummary: riskReason
        };
      }
      return f;
    });

    const updatedSow: Sow = {
      ...selectedSow,
      farrowingHistory: updatedFarrowingHistory
    };

    onUpdateSow(updatedSow);
    setSelectedSow(updatedSow);
    setShowRiskModal(false);
    setEditingFarrowId(null);
    setMaleCount('');
    setFemaleCount('');
    setRiskReason('');
  };

  // Thêm ghi chú nhật ký theo ngày & giờ cho nái
  const handleSaveSowNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSow || !sowNoteText.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      date: noteDate || new Date().toISOString().split('T')[0],
      time: noteTime || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      content: sowNoteText.trim()
    };

    const existingNotes = selectedSow.dailyNotes || [];

    const updatedSow: Sow = {
      ...selectedSow,
      dailyNotes: [newNote, ...existingNotes]
    };

    onUpdateSow(updatedSow);
    setSelectedSow(updatedSow);
    setShowSowNoteModal(false);
    setSowNoteText('');
  };

  // Xóa ghi chú nhật ký
  const handleDeleteSowNote = (noteId: string) => {
    if (!selectedSow) return;

    const updatedNotes = (selectedSow.dailyNotes || []).filter(n => n.id !== noteId);

    const updatedSow: Sow = {
      ...selectedSow,
      dailyNotes: updatedNotes
    };

    onUpdateSow(updatedSow);
    setSelectedSow(updatedSow);
  };

  // Xác nhận tiêm vắc xin
  const handleAdministerVaccine = (vaccineId: string) => {
    if (!selectedSow) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const updatedVaccines = selectedSow.vaccines.map((v) => {
      if (v.id === vaccineId) {
        return {
          ...v,
          status: 'done' as const,
          administeredDate: todayStr
        };
      }
      return v;
    });

    const updatedSow: Sow = {
      ...selectedSow,
      vaccines: updatedVaccines
    };

    onUpdateSow(updatedSow);
    setSelectedSow(updatedSow);
  };

  // Thêm lịch tiêm mới
  const handleAddVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSow || !newVaccineName || !newVaccineDate) return;

    const newVac = {
      id: `vac-${Date.now()}`,
      type: newVaccineType,
      vaccineName: newVaccineName,
      scheduledDate: newVaccineDate,
      dosage: newVaccineDosage || undefined,
      notes: newVaccineNotes || undefined,
      status: 'pending' as const
    };

    const updatedSow: Sow = {
      ...selectedSow,
      vaccines: [...selectedSow.vaccines, newVac]
    };

    onUpdateSow(updatedSow);
    setSelectedSow(updatedSow);
    setShowVaccineModal(false);
    setNewVaccineType('vaccine');
    setNewVaccineName('');
    setNewVaccineDate('');
    setNewVaccineDosage('');
    setNewVaccineNotes('');
  };

  const getStatusBadge = (sow: Sow) => {
    const st = sow.status;
    if (st === 'in_gestation') {
      const latestBreeding = sow.breedingHistory[0];
      if (latestBreeding && latestBreeding.breedingDate) {
        const breedDateObj = new Date(latestBreeding.breedingDate);
        const nowObj = new Date();
        const diffDays = Math.floor((nowObj.getTime() - breedDateObj.getTime()) / (1000 * 60 * 60 * 24));
        const isFailed = latestBreeding.ultrasoundDay21 === 'not_pregnant' || latestBreeding.status === 'failed';

        if (!isFailed && diffDays <= 24) {
          return (
            <span className="status-pill" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
              Mới Phối Thành Công ({diffDays >= 0 ? `${diffDays}d` : 'Mới phối'})
            </span>
          );
        } else if (!isFailed) {
          return (
            <span className="status-pill status-active" style={{ fontWeight: 700 }}>
              Đang Mang Thai ({diffDays}d)
            </span>
          );
        }
      }
      return <span className="status-pill status-active" style={{ fontWeight: 700 }}>Đang Mang Thai</span>;
    }

    switch (st) {
      case 'farrowing':
      case 'nursing':
        return <span className="status-pill status-active">Đã Đẻ</span>;
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
            Theo dõi chu kỳ phối giống, thai kỳ (dự báo ngày đẻ), đỡ đẻ & lịch tiêm phòng vắc xin.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowAddSowModal(true)}>
          + Thêm Heo Nái Mới
        </Button>
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
            placeholder="Tìm Mã Thẻ Tai / Tên Nái..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />

          <div className="sow-list-container">
            {paginatedSows.map((sow) => (
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
                <div style={{ marginTop: '0.5rem' }}>{getStatusBadge(sow)}</div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={sowPage}
            totalItems={filteredSows.length}
            pageSize={PAGE_SIZE}
            onPageChange={setSowPage}
          />
        </div>


        {/* Right Detail Pane */}
        {selectedSow ? (
          <div className="sow-detail-pane container-fade-in">
            {/* Top Detail Header */}
            <div
              className="sow-detail-header container-fade-in sow-header-clickable"
              onClick={() => setShowSowListMenu(true)}
              title="Nhấn để đổi hoặc chọn heo nái khác"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowSowListMenu(true);
                }
              }}
            >
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
                  {getStatusBadge(selectedSow)}
                  <span className="sow-header-select-pill">
                    <span className="sow-pill-text">Nhấn để chọn</span>
                    <span className="sow-pill-count">({filteredSows.length} nái)</span>
                    <span className="sow-pill-arrow">▾</span>
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
                Tiêm Phòng & Thuốc Điều Trị
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

                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Nhật Ký Theo Ngày / Hiện Tượng Heo Nái:</h4>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setNoteDate(new Date().toISOString().split('T')[0]);
                        setNoteTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
                        setSowNoteText('');
                        setShowSowNoteModal(true);
                      }}
                      className="add-sow-note-btn"
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                      title="Thêm Ghi Chú Mới"
                    >
                      <span className="btn-icon-plus">+</span>
                      <span className="btn-text-full"> Thêm Ghi Chú Mới</span>
                    </Button>
                  </div>

                  {selectedSow.dailyNotes && selectedSow.dailyNotes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '210px', overflowY: 'auto', paddingRight: '0.2rem' }}>
                      {selectedSow.dailyNotes.map((dn) => (
                        <div
                          key={dn.id}
                          style={{
                            background: '#ffffff',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '0.5rem'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.2rem' }}>
                              Ngày: {formatDateVN(dn.date)} {dn.time ? `• ${dn.time}` : ''}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#334155', whiteSpace: 'pre-line' }}>
                              {dn.content}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteSowNote(dn.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              padding: '0.1rem 0.3rem'
                            }}
                            title="Xóa ghi chú này"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                      Chưa có ghi chú nhật ký theo ngày. Bấm nút "+ Thêm Ghi Chú Mới" để ghi nhận hiện tượng heo (VD: 15/10 heo bỏ ăn nhẹ, 18/10 hồng hào lại...).
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Sub Tab Content 2: BREEDING & PREGNANCY */}
            {activeSubTab === 'breeding' && (
              <div className="container-fade-in" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Lịch Sử Chu Kỳ Phối Giống & Siêu Âm Thai</h4>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setBreedingDate(getTodayStr());
                      setShowBreedingModal(true);
                    }}
                  >
                    + Thêm Phối Giống Lứa Mới
                  </Button>
                </div>

                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Ngày Phối</th>
                        <th>Phương Pháp & Nguồn Tinh</th>
                        <th>Ngày Dự Sinh (+114 ngày)</th>
                        <th>Trạng Thái</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSow.breedingHistory.length > 0 ? (
                        selectedSow.breedingHistory.map((b) => {
                          // Tính số ngày từ lúc phối đến hôm nay
                          const breedDateObj = new Date(b.breedingDate);
                          const nowObj = new Date();
                          const diffTime = nowObj.getTime() - breedDateObj.getTime();
                          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                          const isFailed = b.ultrasoundDay21 === 'not_pregnant' || b.status === 'failed';
                          const isFarrowed = b.status === 'farrowed';

                          let statusBadge;
                          if (isFailed) {
                            statusBadge = (
                              <span className="status-pill" style={{ background: '#fef2f2', color: '#dc2626', fontWeight: 700 }}>
                                Thất bại - Phối lại
                              </span>
                            );
                          } else if (isFarrowed) {
                            statusBadge = <span className="camp-tag">Đã đẻ</span>;
                          } else if (diffDays <= 24) {
                            statusBadge = (
                              <span className="status-pill" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
                                Mới phối thành công ({diffDays >= 0 ? `${diffDays} ngày` : 'Mới phối'})
                              </span>
                            );
                          } else {
                            statusBadge = (
                              <span className="status-pill status-active" style={{ fontWeight: 700 }}>
                                Đang mang thai ({diffDays} ngày)
                              </span>
                            );
                          }

                          return (
                            <tr key={b.id}>
                              <td><strong>{formatDateVN(b.breedingDate)}</strong></td>
                              <td>
                                <div>{b.method === 'artificial' ? 'Thụ tinh nhân tạo' : 'Phối tự nhiên'}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Tinh: {b.boarCode}</div>
                              </td>
                              <td>
                                <strong style={{ color: isFailed ? '#94a3b8' : '#dc2626' }}>
                                  {isFailed ? 'Hủy lịch dự sinh' : formatDateVN(b.expectedFarrowDate)}
                                </strong>
                              </td>
                              <td>
                                {statusBadge}
                              </td>
                              <td>
                                {!isFailed && !isFarrowed && (
                                  <button
                                    type="button"
                                    disabled={diffDays > 24}
                                    onClick={() => handleMarkBreedingFailed(b.id)}
                                    style={{
                                      fontSize: '0.75rem',
                                      padding: '0.3rem 0.6rem',
                                      background: diffDays > 24 ? '#f1f5f9' : '#fff1f2',
                                      color: diffDays > 24 ? '#94a3b8' : '#be123c',
                                      border: `1px solid ${diffDays > 24 ? '#e2e8f0' : '#fecdd3'}`,
                                      borderRadius: '6px',
                                      cursor: diffDays > 24 ? 'not-allowed' : 'pointer',
                                      fontWeight: 600
                                    }}
                                    title={diffDays > 24 ? 'Nái đã qua 24 ngày an toàn (đang mang thai), không thể báo phối lại' : ''}
                                  >
                                    Báo Không Đậu (Phối Lại)
                                  </button>
                                )}
                                {isFailed && (
                                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Đã ghi nhận phối lại</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
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
                  <Button
                    variant="primary"
                    onClick={() => {
                      setFarrowingDate(getTodayStr());
                      setShowFarrowingModal(true);
                    }}
                  >
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
                                <div className="wean-action-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <Button variant="secondary" onClick={() => handleWeanPigs(f.id)}>
                                    Tách Mẹ
                                  </Button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRiskModal(f.id, f)}
                                    style={{
                                      fontSize: '0.75rem',
                                      padding: '0.45rem 0.75rem',
                                      background: '#fff7ed',
                                      color: '#c2410c',
                                      border: '1px solid #ffedd5',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontWeight: 600
                                    }}
                                  >
                                    Chỉnh Sửa (Đực/Cái/Ghi Chú)
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <span className="status-pill status-active">Đã Tách Mẹ ({formatDateVN(String(f.weanDate))})</span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRiskModal(f.id, f)}
                                    style={{
                                      fontSize: '0.75rem',
                                      padding: '0.3rem 0.6rem',
                                      background: '#f8fafc',
                                      color: '#64748b',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontWeight: 600
                                    }}
                                  >
                                    Chỉnh Sửa
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="farrowing-stat-grid">
                              <div>Con sống: <strong style={{ color: '#16a34a' }}>{f.bornAlive} con</strong>
                                {(f.maleCount !== undefined || f.femaleCount !== undefined) && (
                                  <span style={{ fontSize: '0.8rem', color: '#0369a1', marginLeft: '0.4rem' }}>
                                    ({f.maleCount ?? 0} đực, {f.femaleCount ?? 0} cái)
                                  </span>
                                )}
                              </div>
                              <div>Chết lưu: <strong>{f.stillborn} con</strong></div>
                              <div>Dị tật/chết non: <strong>{f.mummified} con</strong></div>
                            </div>

                            {f.deathReasonSummary && (
                              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#475569', background: '#f1f5f9', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                                <strong>Ghi chú:</strong> {f.deathReasonSummary}
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

            {/* Sub Tab Content 4: VACCINES & TREATMENTS */}
            {activeSubTab === 'vaccines' && (
              <div className="container-fade-in" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Lịch Tiêm Phòng Vắc Xin & Thuốc Điều Trị</h4>
                  <Button variant="primary" onClick={() => setShowVaccineModal(true)}>
                    + Thêm Lịch Tiêm / Dùng Thuốc
                  </Button>
                </div>

                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Loại Tiêm</th>
                        <th>Tên Vắc Xin / Thuốc Điều Trị</th>
                        <th>Liều Lượng & Ghi Chú</th>
                        <th>Ngày Hẹn / Chỉ Định</th>
                        <th>Ngày Đã Tiêm</th>
                        <th>Trạng Thái</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSow.vaccines.length > 0 ? (
                        selectedSow.vaccines.map((v) => (
                          <tr key={v.id}>
                            <td>
                              <span
                                className="status-pill"
                                style={{
                                  background: v.type === 'treatment' ? '#ffedd5' : '#e0f2fe',
                                  color: v.type === 'treatment' ? '#c2410c' : '#0369a1',
                                  fontWeight: 600
                                }}
                              >
                                {v.type === 'treatment' ? 'Thuốc điều trị' : 'Vắc xin phòng'}
                              </span>
                            </td>
                            <td><strong>{v.vaccineName}</strong></td>
                            <td>
                              {v.dosage && <div style={{ fontSize: '0.85rem' }}><strong>Liều:</strong> {v.dosage}</div>}
                              {v.notes && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{v.notes}</div>}
                              {!v.dosage && !v.notes && '---'}
                            </td>
                            <td>{formatDateVN(v.scheduledDate)}</td>
                            <td>{v.administeredDate ? formatDateVN(v.administeredDate) : '---'}</td>
                            <td>
                              <span className={`status-pill status-${v.status === 'done' ? 'active' : 'pending'}`}>
                                {v.status === 'done' ? 'Đã thực hiện' : 'Chờ thực hiện'}
                              </span>
                            </td>
                            <td>
                              {v.status !== 'done' ? (
                                <Button
                                  variant="primary"
                                  onClick={() => handleAdministerVaccine(v.id)}
                                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                >
                                  {v.type === 'treatment' ? 'Dùng Thuốc' : 'Tiêm Phòng'}
                                </Button>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>✓ Đã Hoàn Thành</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                            Chưa có dữ liệu tiêm phòng hoặc thuốc điều trị.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


          </div>
        ) : (
          <div className="sow-detail-pane container-fade-in">
            <div
              className="sow-detail-header container-fade-in sow-header-clickable"
              onClick={() => setShowSowListMenu(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowSowListMenu(true);
                }
              }}
              style={{ textAlign: 'center', padding: '2.5rem 1rem', cursor: 'pointer' }}
            >
              <h2 className="sow-header-title" style={{ color: '#ffffff', marginBottom: '0.5rem' }}>
                📋 Nhấn để chọn heo nái ({filteredSows.length}) ▾
              </h2>
              <p style={{ margin: 0, color: '#e0f2fe', fontSize: '0.95rem' }}>
                Chưa chọn heo nái nào. Nhấn vào đây để mở danh sách và chọn heo nái cần theo dõi.
              </p>
            </div>
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
                label="Mã Thẻ Tai / Tên Nái"
                placeholder="VD: NAI-8805 (Nái Đen), NAI-01..."
                value={rfidTag}
                onChange={(e) => setRfidTag(e.target.value)}
                required
              />
              <Input
                label="Giống Heo Nái"
                placeholder="VD: Landrace, Yorkshire, Duroc..."
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
              <DatePicker
                label="Ngày sinh heo nái"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
              <Input
                label="Phân vào Chuồng"
                placeholder="VD: CH-A1, CH-B2..."
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
              <div style={{ position: 'relative' }}>
                <DatePicker
                  label="Ngày phối giống"
                  value={breedingDate}
                  onChange={(e) => setBreedingDate(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setBreedingDate(getTodayStr())}
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '2px 6px',
                    textDecoration: 'underline'
                  }}
                  title="Chọn nhanh ngày hôm nay"
                >
                  Lấy ngày hôm nay
                </button>
              </div>
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
              <div style={{ position: 'relative' }}>
                <DatePicker
                  label="Ngày đẻ thực tế"
                  value={farrowingDate}
                  onChange={(e) => setFarrowingDate(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setFarrowingDate(getTodayStr())}
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '2px 6px',
                    textDecoration: 'underline'
                  }}
                  title="Chọn nhanh ngày hôm nay"
                >
                  Lấy ngày hôm nay
                </button>
              </div>
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

              <div>
                <Input
                  label="Số con mummified/dị tật"
                  type="number"
                  value={mummified}
                  onChange={(e) => setMummified(e.target.value)}
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

      {/* Vaccine & Treatment Modal */}
      {showVaccineModal && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in">
            <div className="modal-header">
              <h3>Kê Đơn Tiêm Phòng Vắc Xin / Thuốc Điều Trị</h3>
              <button className="close-btn" onClick={() => setShowVaccineModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddVaccine} className="modal-form">
              <Dropdown
                label="Phân Loại Tiêm"
                options={[
                  { label: 'Vắc Xin Phòng Bệnh (Định Kỳ Theo Tuổi Thai)', value: 'vaccine' },
                  { label: 'Thuốc Điều Trị Bệnh (Kháng Sinh, Hạ Sốt, Bổ Sức)', value: 'treatment' }
                ]}
                value={newVaccineType}
                onChange={(e) => setNewVaccineType(e.target.value as 'vaccine' | 'treatment')}
              />
              <Input
                label={newVaccineType === 'treatment' ? 'Tên Thuốc / Kháng Sinh' : 'Tên Vắc Xin / Kháng Thể'}
                placeholder={newVaccineType === 'treatment' ? 'VD: Amoxicillin, Tylosin, Penicillin...' : 'VD: Vắc xin Dịch Tả, E. coli, PRRS...'}
                value={newVaccineName}
                onChange={(e) => setNewVaccineName(e.target.value)}
                required
              />
              <DatePicker
                label={newVaccineType === 'treatment' ? 'Ngày Chỉ Định / Dùng Thuốc' : 'Ngày Hẹn Tiêm Dự Kiến'}
                value={newVaccineDate}
                onChange={(e) => setNewVaccineDate(e.target.value)}
                required
              />
              <Input
                label="Liều Lượng (ml hoặc liều/con)"
                placeholder="VD: 5ml / con, 2ml / con..."
                value={newVaccineDosage}
                onChange={(e) => setNewVaccineDosage(e.target.value)}
              />
              <Input
                label="Ghi Chú Bệnh / Chỉ Định Điều Trị"
                placeholder="VD: Sốt bỏ ăn, ho nhẹ, tiêm nhắc lại sau 3 ngày..."
                value={newVaccineNotes}
                onChange={(e) => setNewVaccineNotes(e.target.value)}
              />

              <div className="modal-actions">
                <Button type="button" variant="outline" onClick={() => setShowVaccineModal(false)}>Hủy</Button>
                <Button type="submit" variant="primary">Lưu Đơn Tiêm / Thuốc</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Farrowing Detail Modal (Đực/Cái/Ghi Chú) */}
      {showRiskModal && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in">
            <div className="modal-header">
              <h3>Chỉnh Sửa Chi Tiết Lứa Đẻ</h3>
              <button className="close-btn" onClick={() => setShowRiskModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveRiskReason} className="modal-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Input
                  label="Số con đực"
                  type="number"
                  placeholder="VD: 6"
                  value={maleCount}
                  onChange={(e) => setMaleCount(e.target.value)}
                />
                <Input
                  label="Số con cái"
                  type="number"
                  placeholder="VD: 6"
                  value={femaleCount}
                  onChange={(e) => setFemaleCount(e.target.value)}
                />
              </div>

              <Input
                label="Ghi Chú (Nguyên nhân rủi ro, heo chết non, lưu ý sức khỏe...)"
                placeholder="VD: Mẹ đè 1 con ngày thứ 2, heo con tiêu chảy..."
                value={riskReason}
                onChange={(e) => setRiskReason(e.target.value)}
              />

              <div className="modal-actions">
                <Button type="button" variant="outline" onClick={() => setShowRiskModal(false)}>Hủy</Button>
                <Button type="submit" variant="primary">Lưu Chỉnh Sửa</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sow Note Edit Modal */}
      {showSowNoteModal && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in">
            <div className="modal-header">
              <h3>Cập Nhật Nhật Ký Ghi Chú Heo Nái</h3>
              <button className="close-btn" onClick={() => setShowSowNoteModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveSowNote} className="modal-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <DatePicker
                  label="Ngày ghi nhận"
                  value={noteDate}
                  onChange={(e) => setNoteDate(e.target.value)}
                  required
                />
                <Input
                  label="Giờ ghi nhận"
                  type="text"
                  placeholder="VD: 08:30"
                  value={noteTime}
                  onChange={(e) => setNoteTime(e.target.value)}
                />
              </div>

              <Input
                label="Nội dung hiện tượng / Sức khỏe heo"
                placeholder="VD: Heo bỏ ăn nhẹ, ho hắt hơi, ủ rũ..."
                value={sowNoteText}
                onChange={(e) => setSowNoteText(e.target.value)}
                required
              />

              <div className="modal-actions">
                <Button type="button" variant="outline" onClick={() => setShowSowNoteModal(false)}>Hủy</Button>
                <Button type="submit" variant="primary">Lưu Ghi Chú</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Notification Modal Dialog */}
      {notificationMsg && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-card modal-card-auto animate-fade-in" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="modal-header" style={{ justifyContent: 'center' }}>
              <h3 style={{ color: 'var(--primary)' }}>Thông Báo Hệ Thống</h3>
            </div>
            <div style={{ padding: '1.25rem 0', fontSize: '0.925rem', color: '#334155', fontWeight: 600 }}>
              {notificationMsg}
            </div>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <Button variant="primary" onClick={() => setNotificationMsg(null)} style={{ padding: '0.5rem 1.5rem' }}>
                Đã Hiểu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
