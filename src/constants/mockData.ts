import type { PigPen, Pig, FeedingLog, Sow } from '../types';

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
