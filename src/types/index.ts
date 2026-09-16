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
  deathReasonSummary?: string; // Lý do chết bú sữa (đè, tiêu chảy, thiếu sữa)
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
  vaccineName: string;         // Tên vacxin (Parvovirus, PRRS, E. coli...)
  scheduledDate: string;       // Ngày hẹn tiêm theo lứa/tuổi thai
  status: 'done' | 'pending' | 'overdue';
  administeredDate?: string;
  notes?: string;
}

export interface Sow {
  id: string;
  rfidTag: string;             // Mã số thẻ tai / RFID (VD: NAI-8801)
  breed: string;               // Giống heo (Landrace, Yorkshire, Duroc...)
  birthDate: string;           // Ngày sinh
  penCode: string;             // Đang ở chuồng nào
  currentParity: number;       // Lứa đẻ hiện tại
  status: 'waiting' | 'in_gestation' | 'farrowing' | 'nursing' | 'weaned'; // Trạng thái chu kỳ
  healthStatus: 'healthy' | 'monitoring' | 'sick';
  breedingHistory: BreedingRecord[];
  farrowingHistory: FarrowingRecord[];
  vaccines: VaccineSchedule[];
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
