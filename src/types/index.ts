export interface PigPen {
  id: string;
  penCode: string;          // Mã chuồng (VD: CH-A1)
  name: string;             // Tên khu chuồng
  type: 'farrowing' | 'weaning' | 'fattening' | 'breeding'; // Nái đẻ, Cai sữa, Thịt, Phối giống
  totalPigs: number;       // Số lượng heo trong chuồng
  capacity: number;        // Sức chứa tối đa
  temperature: number;     // Nhiệt độ hiện tại (°C)
  humidity: number;        // Độ ẩm (%)
  status: 'good' | 'warning' | 'full';
}

export interface FarrowingRecord {
  id: string;
  parityNumber: number;        // Lứa đẻ thứ mấy (VD: 1, 2, 3)
  farrowingDate: string;       // Ngày đẻ thực tế
  bornAlive: number;           // Số con sống
  stillborn: number;           // Số con chết lưu
  mummified: number;           // Số con dị tật / chết non
  totalBornWeightKg: number;   // Trọng lượng sơ sinh cả đàn (kg)
  weanedCount?: number;        // Số con cai sữa thành công
  weanedWeightKg?: number;     // Tổng cân nặng lúc cai sữa
  weanDate?: number | string;  // Ngày cai sữa
  maleCount?: number;          // Số con đực
  femaleCount?: number;        // Số con cái
  deathReasonSummary?: string; // Ghi chú rủi ro / chết non
}

export interface BreedingRecord {
  id: string;
  breedingDate: string;        // Ngày phối giống
  method: 'artificial' | 'natural'; // Thụ tinh nhân tạo hay Phối tự nhiên
  boarCode: string;            // Mã đực/nguồn tinh (VD: DUC-99)
  technician: string;          // Người phối
  timesCount: number;          // Số lần phối trong chu kỳ (1 hay 2)
  ultrasoundDay21: 'pregnant' | 'not_pregnant' | 'pending'; // Khám thai ngày 21-25
  ultrasoundDay60: 'pregnant' | 'not_pregnant' | 'pending'; // Khám thai ngày 60
  expectedFarrowDate: string;  // Tự động tính: ngày phối + 114 ngày
  status: 'in_gestation' | 'farrowed' | 'failed' | 'waiting';
}

export interface VaccineSchedule {
  id: string;
  vaccineName: string;         // Tên vắc xin hoặc thuốc điều trị bệnh (VD: Parvovirus, Amoxicillin, Tylosin...)
  type?: 'vaccine' | 'treatment'; // Phân loại: Vắc xin phòng bệnh hoặc Thuốc điều trị bệnh
  scheduledDate: string;       // Ngày hẹn tiêm / Ngày chỉ định thuốc
  status: 'done' | 'pending' | 'overdue';
  administeredDate?: string;
  dosage?: string;             // Liều lượng (VD: 5ml, 2 mũi...)
  notes?: string;              // Ghi chú chẩn đoán bệnh
}

export interface SowDailyNote {
  id: string;
  date: string;       // Ngày ghi chú (YYYY-MM-DD)
  time?: string;      // Giờ ghi chú (VD: 08:30)
  content: string;    // Nội dung hiện tượng
}

export interface Sow {
  id: string;
  rfidTag: string;             // Mã số thẻ tai / RFID (VD: NAI-8801)
  name?: string;               // Tên nái mẹ (VD: Nái Mẹ 8801, Nái Bông...)
  breed: string;               // Giống heo (Landrace, Yorkshire, Duroc...)
  birthDate: string;           // Ngày sinh
  penCode: string;             // Đang ở chuồng nào
  currentParity: number;       // Lứa đẻ hiện tại
  status: 'waiting' | 'in_gestation' | 'farrowing' | 'nursing' | 'weaned'; // Trạng thái chu kỳ
  healthStatus: 'healthy' | 'monitoring' | 'sick';
  breedingHistory: BreedingRecord[];
  farrowingHistory: FarrowingRecord[];
  vaccines: VaccineSchedule[];
  dailyNotes?: SowDailyNote[];
  notes?: string;
}

export interface Pig {
  id: string;
  pigCode: string;
  penCode: string;
  gender: 'nái' | 'đực' | 'thịt';
  weightKg: number;
  birthDate: string;
  healthStatus: 'healthy' | 'sick' | 'monitoring' | 'vaccinated';
  vaccineHistory?: string;
  notes?: string;
}

export interface FeedingLog {
  id: string;
  penCode: string;
  time: string;
  feedType: string;
  amountKg: number;
  author: string;
  notes?: string;
}

export interface PigletSaleRecord {
  id: string;
  saleType: 'pair' | 'single' | 'all';
  pairCount?: number;     // Số cặp (nếu bán cặp)
  pricePerPair?: number;  // Đơn giá 1 cặp (VNĐ)
  singleCount?: number;   // Số con (nếu bán lẻ/đơn hoặc bán hết)
  pricePerPig?: number;   // Đơn giá 1 con (VNĐ)
  totalSoldPigs: number;  // Tổng số con đã bán trong lần này
  totalPrice: number;     // Tổng thành tiền (VNĐ)
  buyerName: string;      // Tên mối mua / thương lái
  saleDate: string;       // Ngày bán
}

export interface PigletBatch {
  id: string;
  batchCode: string;           // Mã lứa heo con (VD: LUA-2026-01)
  sowRfid: string;             // Mẹ nái mã bao nhiêu
  sowName?: string;            // Tên nái mẹ
  birthDate: string;           // Ngày sinh
  initialCount?: number;       // Số lượng ban đầu khi mới đẻ / tách mẹ
  totalCount: number;          // Tổng số con hiện tại còn lại trong lứa
  maleCount: number;           // Số con đực
  femaleCount: number;         // Số con cái
  avgWeightKg?: number;        // Trọng lượng trung bình (kg)
  penCode: string;             // Ở chuồng nào (VD: CH-C1)
  weanDate?: string;           // Ngày tách mẹ
  status: 'nursing' | 'weaned' | 'transferred' | 'sold'; // Đang theo mẹ, Đã tách mẹ, Đã chuyển chuồng, Đã xuất bán
  saleType?: 'pair' | 'single' | 'all';  // Bán cặp, Bán đơn, Bán hết cả lứa
  soldQuantity?: number;                  // Tổng số lượng đã bán qua các đợt
  salePrice?: number;                     // Tổng doanh thu đã bán
  buyerName?: string;                     // Mối mua gần nhất / tổng hợp
  saleDate?: string;                      // Ngày xuất bán
  salesHistory?: PigletSaleRecord[];       // Lịch sử các lần xuất bán cho nhiều mối
  healthStatus: 'healthy' | 'monitoring' | 'sick';
  notes?: string;
}

export interface InventoryItem {
  id: string;
  itemCode?: string;           // Mã vật tư / kho (VD: KHO-MED-01)
  name: string;                // Tên vật tư/thuốc/cám/thiết bị
  category: 'medicine' | 'feed' | 'equipment' | 'other'; // Loại kho: Thuốc men, Cám thức ăn, Trang thiết bị
  unit: string;                // Đơn vị tính (Chai, Bao, Cái, Bộ, Kg...)
  quantity: number;            // Số lượng tồn kho hiện tại
  minQuantity: number;         // Ngưỡng cảnh báo tồn tối thiểu
  unitPrice: number;           // Đơn giá (VNĐ)
  supplier?: string;           // Nhà cung cấp
  lastUpdated: string;         // Ngày cập nhật gần nhất
  notes?: string;
}

export interface UsedSupplyRecord {
  id: string;
  itemId?: string;             // ID vật tư (nếu liên kết với kho)
  name: string;                // Tên vật tư / thuốc / cám đã dùng
  category: 'medicine' | 'feed' | 'equipment' | 'other';
  quantity: number;            // Số lượng đã sử dụng
  unit: string;                // Đơn vị tính (Chai, Bao, Cái, Liều...)
  unitPrice?: number;          // Đơn giá lúc xuất dùng (VNĐ)
  totalCost?: number;          // Thành tiền = quantity * unitPrice (VNĐ)
  usedDate: string;            // Ngày sử dụng (YYYY-MM-DD)
  purpose?: string;            // Mục đích / Nơi dùng (VD: Tiêm phòng đàn nái, Chuồng A1...)
  usedBy?: string;             // Người thực hiện / Kỹ thuật viên
  notes?: string;              // Ghi chú thêm
}

export interface FarmExpense {
  id: string;
  title: string;                 // Tiêu đề / Nội dung chi phí phát sinh
  category: 'utilities' | 'labor' | 'maintenance' | 'feed_additive' | 'transport' | 'other';
  amount: number;                // Số tiền (VNĐ)
  date: string;                  // Ngày chi (YYYY-MM-DD)
  payer?: string;                // Người thanh toán / thực hiện
  notes?: string;                // Ghi chú chi tiết
}
