import type { PigPen, Pig, FeedingLog, Sow, PigletBatch, InventoryItem, UsedSupplyRecord, FarmExpense } from '../types';

export const MOCK_PIG_PENS: PigPen[] = [
  {
    id: 'pen-1',
    penCode: 'CH-A1',
    name: 'Khu Chuồng Heo Nái Đẻ A1',
    type: 'farrowing',
    totalPigs: 12,
    capacity: 15,
    temperature: 26.5,
    humidity: 65,
    status: 'good'
  },
  {
    id: 'pen-2',
    penCode: 'CH-B2',
    name: 'Khu Chuồng Heo Thịt Tăng Trưởng B2',
    type: 'fattening',
    totalPigs: 45,
    capacity: 50,
    temperature: 28.0,
    humidity: 70,
    status: 'warning'
  },
  {
    id: 'pen-3',
    penCode: 'CH-C1',
    name: 'Khu Chuồng Heo Cai Sữa C1',
    type: 'weaning',
    totalPigs: 30,
    capacity: 30,
    temperature: 27.2,
    humidity: 62,
    status: 'full'
  }
];

export const MOCK_SOWS: Sow[] = [
  {
    id: 'sow-1',
    rfidTag: 'NAI-8801',
    name: 'Nái Mẹ 8801',
    breed: 'Landrace Thuần Chủng',
    birthDate: '2023-04-10',
    penCode: 'CH-A1',
    currentParity: 3,
    status: 'nursing',
    healthStatus: 'healthy',
    notes: 'Heo nái giống tốt, phom dáng chuẩn, sữa nhiều',
    breedingHistory: [
      {
        id: 'b-1',
        breedingDate: '2026-05-15',
        method: 'artificial',
        boarCode: 'DUC-99 (Duroc)',
        technician: 'KTV Hoàng',
        timesCount: 2,
        ultrasoundDay21: 'pregnant',
        ultrasoundDay60: 'pregnant',
        expectedFarrowDate: '2026-09-07',
        status: 'farrowed'
      }
    ],
    farrowingHistory: [
      {
        id: 'f-1',
        parityNumber: 1,
        farrowingDate: '2024-08-10',
        bornAlive: 11,
        stillborn: 0,
        mummified: 0,
        totalBornWeightKg: 15.4,
        weanedCount: 11,
        weanedWeightKg: 77.0,
        weanDate: '2024-09-07',
        deathReasonSummary: 'Không có'
      },
      {
        id: 'f-2',
        parityNumber: 2,
        farrowingDate: '2025-02-14',
        bornAlive: 12,
        stillborn: 1,
        mummified: 0,
        totalBornWeightKg: 16.8,
        weanedCount: 11,
        weanedWeightKg: 78.5,
        weanDate: '2025-03-14',
        deathReasonSummary: '1 con bị nái đè vô tình ngày thứ 2'
      },
      {
        id: 'f-3',
        parityNumber: 3,
        farrowingDate: '2026-09-07',
        bornAlive: 13,
        stillborn: 0,
        mummified: 1,
        totalBornWeightKg: 18.2,
        weanedCount: 12,
        weanedWeightKg: 84.0,
        weanDate: 'Đang bú sữa (Dự kiến 05/10)',
        deathReasonSummary: '1 con dị tật bẩm sinh'
      }
    ],
    vaccines: [
      {
        id: 'v-1',
        vaccineName: 'Vắc xin Giả dại (Pseudorabies)',
        scheduledDate: '2026-04-10',
        status: 'done',
        administeredDate: '2026-04-10'
      },
      {
        id: 'v-2',
        vaccineName: 'Vắc xin Tai xanh (PRRS)',
        scheduledDate: '2026-06-01',
        status: 'done',
        administeredDate: '2026-06-01'
      },
      {
        id: 'v-3',
        vaccineName: 'Vắc xin E. coli (Tiền đẻ 2 tuần)',
        scheduledDate: '2026-08-24',
        status: 'done',
        administeredDate: '2026-08-24'
      }
    ]
  },
  {
    id: 'sow-2',
    rfidTag: 'NAI-8802',
    name: 'Nái Mẹ 8802',
    breed: 'Yorkshire Siêu Nái',
    birthDate: '2023-08-20',
    penCode: 'CH-A1',
    currentParity: 2,
    status: 'in_gestation',
    healthStatus: 'healthy',
    notes: 'Đang mang thai lứa 2, siêu âm thai phát triển tốt',
    breedingHistory: [
      {
        id: 'b-2',
        breedingDate: '2026-07-01',
        method: 'artificial',
        boarCode: 'DUC-88 (Pietrain)',
        technician: 'KTV Nam',
        timesCount: 2,
        ultrasoundDay21: 'pregnant',
        ultrasoundDay60: 'pregnant',
        expectedFarrowDate: '2026-10-23',
        status: 'in_gestation'
      }
    ],
    farrowingHistory: [
      {
        id: 'f-2-1',
        parityNumber: 1,
        farrowingDate: '2025-01-10',
        bornAlive: 10,
        stillborn: 1,
        mummified: 0,
        totalBornWeightKg: 14.0,
        weanedCount: 10,
        weanedWeightKg: 68.0,
        weanDate: '2025-02-07',
        deathReasonSummary: 'Không có'
      }
    ],
    vaccines: [
      {
        id: 'v-2-1',
        vaccineName: 'Vắc xin Lở cổ long móng (FMD)',
        scheduledDate: '2026-06-15',
        status: 'done',
        administeredDate: '2026-06-15'
      },
      {
        id: 'v-2-2',
        vaccineName: 'Vắc xin E. coli (Dự kiến 09/10)',
        scheduledDate: '2026-10-09',
        status: 'pending'
      }
    ]
  },
  {
    id: 'sow-3',
    rfidTag: 'NAI-8803',
    name: 'Nái Mẹ 8803',
    breed: 'Duroc Hậu Bị',
    birthDate: '2024-02-01',
    penCode: 'CH-A1',
    currentParity: 0,
    status: 'waiting',
    healthStatus: 'monitoring',
    notes: 'Đang lên giống lần 2, chờ lên kế hoạch phối tinh',
    breedingHistory: [],
    farrowingHistory: [],
    vaccines: [
      {
        id: 'v-3-1',
        vaccineName: 'Vắc xin Khô thai (Parvovirus)',
        scheduledDate: '2026-09-01',
        status: 'done',
        administeredDate: '2026-09-01'
      }
    ]
  }
];

export const MOCK_PIGS: Pig[] = [
  {
    id: 'pig-1',
    pigCode: 'H-1001',
    penCode: 'CH-A1',
    gender: 'nái',
    weightKg: 185,
    birthDate: '2024-03-15',
    healthStatus: 'healthy',
    vaccineHistory: 'Đã tiêm Tai xanh (PRRS), Dịch tả heo',
    notes: 'Nái nuôi con tốt'
  },
  {
    id: 'pig-2',
    pigCode: 'H-2045',
    penCode: 'CH-B2',
    gender: 'thịt',
    weightKg: 78,
    birthDate: '2025-11-10',
    healthStatus: 'monitoring',
    vaccineHistory: 'Đã tiêm Lở cổ long móng (FMD)',
    notes: 'Sốt nhẹ buổi sáng, đang theo dõi'
  }
];

export const MOCK_FEEDING_LOGS: FeedingLog[] = [
  {
    id: 'f-1',
    penCode: 'CH-A1',
    time: '06:30 - 16/09/2026',
    feedType: 'Cám Hỗn Hợp Nái Nuôi Con (PigFeed-A)',
    amountKg: 45,
    author: 'Anh Tuấn',
    notes: 'Bổ sung thêm vitamin C'
  }
];

export const MOCK_PIGLET_BATCHES: PigletBatch[] = [
  {
    id: 'pb-1',
    batchCode: 'LUA-NAI-8801-L2',
    sowRfid: 'NAI-8801',
    sowName: 'Nái Mẹ 8801',
    birthDate: '2025-02-14',
    initialCount: 12,
    totalCount: 4,
    maleCount: 2,
    femaleCount: 2,
    avgWeightKg: 7.1,
    penCode: 'CH-C1',
    weanDate: '2025-03-14',
    status: 'weaned',
    soldQuantity: 8,
    salePrice: 12000000,
    buyerName: 'Anh Tám (Mối Chợ Vó)',
    saleDate: '2026-09-15',
    salesHistory: [
      {
        id: 'sale-1',
        saleType: 'pair',
        pairCount: 2,
        pricePerPair: 3000000,
        totalSoldPigs: 4,
        totalPrice: 6000000,
        buyerName: 'Anh Tám (Mối Chợ Vó)',
        saleDate: '2026-09-12'
      },
      {
        id: 'sale-2',
        saleType: 'pair',
        pairCount: 2,
        pricePerPair: 3000000,
        totalSoldPigs: 4,
        totalPrice: 6000000,
        buyerName: 'Chị Hoa (Trại Giống)',
        saleDate: '2026-09-15'
      }
    ],
    healthStatus: 'healthy',
    notes: 'Lứa đẻ thứ #2 của nái NAI-8801 (Đã tách mẹ ngày 14/03/2025)'
  },
  {
    id: 'pb-2',
    batchCode: 'LUA-NAI-8802-L1',
    sowRfid: 'NAI-8802',
    sowName: 'Nái Mẹ 8802',
    birthDate: '2025-01-10',
    initialCount: 10,
    totalCount: 0,
    maleCount: 5,
    femaleCount: 5,
    avgWeightKg: 6.8,
    penCode: 'CH-C1',
    weanDate: '2025-02-07',
    status: 'sold',
    soldQuantity: 10,
    salePrice: 15000000,
    buyerName: 'Thương lái Minh',
    saleDate: '2026-08-25',
    salesHistory: [
      {
        id: 'sale-3',
        saleType: 'all',
        singleCount: 10,
        pricePerPig: 1500000,
        totalSoldPigs: 10,
        totalPrice: 15000000,
        buyerName: 'Thương lái Minh',
        saleDate: '2026-08-25'
      }
    ],
    healthStatus: 'healthy',
    notes: 'Lứa đẻ thứ #1 của nái NAI-8802 (Đã tách mẹ ngày 07/02/2025)'
  },
  {
    id: 'pb-3',
    batchCode: 'LUA-NAI-8801-L1',
    sowRfid: 'NAI-8801',
    sowName: 'Nái Mẹ 8801',
    birthDate: '2025-05-10',
    initialCount: 11,
    totalCount: 0,
    maleCount: 6,
    femaleCount: 5,
    avgWeightKg: 7.0,
    penCode: 'CH-C1',
    weanDate: '2025-06-10',
    status: 'sold',
    soldQuantity: 11,
    salePrice: 16500000,
    buyerName: 'Anh Tám (Mối Chợ Vó)',
    saleDate: '2025-10-15',
    salesHistory: [
      {
        id: 'sale-2025-1',
        saleType: 'all',
        singleCount: 11,
        pricePerPig: 1500000,
        totalSoldPigs: 11,
        totalPrice: 16500000,
        buyerName: 'Anh Tám (Mối Chợ Vó)',
        saleDate: '2025-10-15'
      }
    ],
    healthStatus: 'healthy',
    notes: 'Lứa đẻ thứ 1 năm 2025 của nái 8801 (Đã xuất bán hết)'
  }
];

export const MOCK_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'inv-1',
    itemCode: 'THUOC-01',
    name: 'Vắc xin PRRS (Tai Xanh)',
    category: 'medicine',
    unit: 'Chai (50 liều)',
    quantity: 15,
    minQuantity: 5,
    unitPrice: 450000,
    supplier: 'Công ty Thuốc Thú Y Navetco',
    lastUpdated: '2026-09-10',
    notes: 'Bảo quản ngăn mát 2-8°C'
  },
  {
    id: 'inv-2',
    itemCode: 'THUOC-02',
    name: 'Kháng sinh Amoxicillin 10%',
    category: 'medicine',
    unit: 'Chai 100ml',
    quantity: 24,
    minQuantity: 10,
    unitPrice: 120000,
    supplier: 'Pharmavet',
    lastUpdated: '2026-09-12',
    notes: 'Đặc trị tiêu chảy, viêm phổi'
  },
  {
    id: 'inv-3',
    itemCode: 'CAM-01',
    name: 'Cám Nái Nuôi Con Premium (Dạng Hạt)',
    category: 'feed',
    unit: 'Bao (40kg)',
    quantity: 85,
    minQuantity: 20,
    unitPrice: 380000,
    supplier: 'C.P. Việt Nam',
    lastUpdated: '2026-09-15',
    notes: 'Kho A - Kệ 01'
  },
  {
    id: 'inv-4',
    itemCode: 'CAM-02',
    name: 'Cám Tập Ăn Heo Con (Sữa Bột)',
    category: 'feed',
    unit: 'Bao (25kg)',
    quantity: 40,
    minQuantity: 15,
    unitPrice: 520000,
    supplier: 'C.P. Việt Nam',
    lastUpdated: '2026-09-14',
    notes: 'Dành cho heo con tập ăn từ 7 ngày tuổi'
  },
  {
    id: 'inv-5',
    itemCode: 'TB-01',
    name: 'Xy-lanh Tiêm Tự Động 5ml',
    category: 'equipment',
    unit: 'Cái',
    quantity: 8,
    minQuantity: 3,
    unitPrice: 250000,
    supplier: 'Thiết Bị Thú Y Chăn Nuôi',
    lastUpdated: '2026-09-01',
    notes: 'Thiết bị tiêm vắc xin hàng loạt'
  },
  {
    id: 'inv-6',
    itemCode: 'TB-02',
    name: 'Thẻ Tai Định Danh RFID',
    category: 'equipment',
    unit: 'Cái',
    quantity: 120,
    minQuantity: 30,
    unitPrice: 15000,
    supplier: 'SmartTag Vietnam',
    lastUpdated: '2026-09-05',
    notes: 'Dùng cho heo nái hậu bị mới'
  }
];

export const MOCK_USED_SUPPLIES: UsedSupplyRecord[] = [
  {
    id: 'used-1',
    itemId: 'inv-1',
    name: 'Vắc xin PRRS (Tai Xanh)',
    category: 'medicine',
    quantity: 2,
    unit: 'Chai (50 liều)',
    unitPrice: 450000,
    totalCost: 900000,
    usedDate: '2026-09-18',
    purpose: 'Tiêm phòng định kỳ heo nái khu chuồng CH-A1',
    usedBy: 'KTV Hoàng',
    notes: 'Tiêm hoàn thành cho đàn 12 nái'
  },
  {
    id: 'used-2',
    itemId: 'inv-3',
    name: 'Cám Nái Nuôi Con Premium (Dạng Hạt)',
    category: 'feed',
    quantity: 5,
    unit: 'Bao (40kg)',
    unitPrice: 380000,
    totalCost: 1900000,
    usedDate: '2026-09-19',
    purpose: 'Cung cấp thức ăn hàng ngày chuồng nái đẻ CH-A1',
    usedBy: 'Anh Tuấn',
    notes: 'Xuất theo định mức tuần'
  },
  {
    id: 'used-3',
    itemId: 'inv-2',
    name: 'Kháng sinh Amoxicillin 10%',
    category: 'medicine',
    quantity: 1,
    unit: 'Chai 100ml',
    unitPrice: 120000,
    totalCost: 120000,
    usedDate: '2026-09-20',
    notes: 'Liều 10ml/ngày'
  },
  {
    id: 'used-4',
    itemId: 'inv-3',
    name: 'Cám Nái Nuôi Con Premium (Dạng Hạt)',
    category: 'feed',
    quantity: 8,
    unit: 'Bao (40kg)',
    unitPrice: 380000,
    totalCost: 3040000,
    usedDate: '2025-09-20',
    notes: 'Xuất dùng nuôi đàn lứa đẻ năm 2025'
  }
];

export const MOCK_FARM_EXPENSES: FarmExpense[] = [
  {
    id: 'exp-1',
    title: 'Tiền điện thắp sáng và quạt làm mát chuồng tháng 09/2026',
    category: 'utilities',
    amount: 2450000,
    date: '2026-09-20',
    notes: 'Hóa đơn Điện lực (EVN)'
  },
  {
    id: 'exp-2',
    title: 'Mua trấu lót chuồng & vôi bột khử trùng chuồng trại',
    category: 'maintenance',
    amount: 850000,
    date: '2026-09-17',
    notes: '20 bao trấu + 5 bao vôi bột'
  },
  {
    id: 'exp-3',
    title: 'Công kỹ thuật viên phối tinh & chăm sóc heo đẻ',
    category: 'labor',
    amount: 1500000,
    date: '2026-09-15',
    notes: 'Thanh toán đợt đỡ đẻ nái NAI-8801'
  },
  {
    id: 'exp-4',
    title: 'Cước vận chuyển cám từ đại lý về trại',
    category: 'transport',
    amount: 350000,
    date: '2026-09-14',
    notes: 'Chở 125 bao cám'
  },
  {
    id: 'exp-5',
    title: 'Tiền điện thắp sáng và sưởi ấm chuồng tháng 10/2025',
    category: 'utilities',
    amount: 1950000,
    date: '2025-10-25',
    notes: 'Hóa đơn điện lực năm 2025'
  }
];


