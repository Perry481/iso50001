import type { NextApiRequest, NextApiResponse } from "next";

export interface Equipment {
  id?: string | number;
  code: string;
  name: string;
  referenceCode?: string;
  manufacturer: string;
  equipmentType: string;
  workArea: string;
  department: string;
  usageGroup: string;
  status: string;
  ratedPower: number;
  actualPower?: number;
  powerUnit: string;
  assetNumber?: string;
  quantity: number;
  note?: string;
}

export interface DeviceReference {
  MachineID: string;
  MachineName: string;
  KWHour: number | null;
}

interface ApiResponse {
  equipments?: Equipment[];
  equipment?: Equipment;
  deviceReferences?: DeviceReference[];
  message?: string;
}

// Mock data based on the image
export const mockEquipments: Equipment[] = [
  {
    id: 101,
    code: "JN01-1",
    name: "自動壓著機",
    referenceCode: "101",
    manufacturer: "台電電力",
    equipmentType: "生產設備",
    workArea: "總廠",
    department: "(未設定)",
    usageGroup: "自動壓著機",
    status: "報廢",
    ratedPower: 2.2,
    powerUnit: "度",
    quantity: 1,
  },
  {
    id: 102,
    code: "ZERO-2",
    name: "自動壓著機",
    referenceCode: "102",
    manufacturer: "台電電力",
    equipmentType: "生產設備",
    workArea: "總廠",
    department: "(未設定)",
    usageGroup: "自動壓著機",
    status: "使用中",
    ratedPower: 1.5,
    powerUnit: "度",
    quantity: 1,
  },
  {
    id: 103,
    code: "JN03",
    name: "自動壓著機",
    referenceCode: "103",
    manufacturer: "台電電力",
    equipmentType: "生產設備",
    workArea: "車用廠(1F)",
    department: "(未設定)",
    usageGroup: "自動壓著機",
    status: "使用中",
    ratedPower: 2.2,
    powerUnit: "度",
    quantity: 1,
  },
  {
    id: 109,
    code: "JN01SS-1",
    name: "自動壓著機",
    referenceCode: "109",
    manufacturer: "台電電力",
    equipmentType: "生產設備",
    workArea: "總廠",
    department: "(未設定)",
    usageGroup: "自動壓著機",
    status: "使用中",
    ratedPower: 2.2,
    powerUnit: "度",
    assetNumber: "0002702",
    quantity: 1,
  },
];

// Mock data for device references
export const mockDeviceReferences: DeviceReference[] = [
  {
    MachineID: "111",
    MachineName: "8 壓著機",
    KWHour: 0.25,
  },
  {
    MachineID: "125",
    MachineName: "125 檢驗台",
    KWHour: 0.4,
  },
  {
    MachineID: "128",
    MachineName: "128-SLQ-201X",
    KWHour: null,
  },
  {
    MachineID: "163",
    MachineName: "熱風槍(加工戶)",
    KWHour: 1.5,
  },
  {
    MachineID: "164",
    MachineName: "儲氣罐(大)",
    KWHour: null,
  },
  {
    MachineID: "165",
    MachineName: "儲氣罐(大)",
    KWHour: null,
  },
  {
    MachineID: "166",
    MachineName: "乾燥機",
    KWHour: null,
  },
  {
    MachineID: "167",
    MachineName: "儲氣罐(小)",
    KWHour: null,
  },
  {
    MachineID: "168",
    MachineName: "儲氣罐(小)",
    KWHour: null,
  },
  {
    MachineID: "169",
    MachineName: "電源供應器",
    KWHour: null,
  },
  {
    MachineID: "170",
    MachineName: "電腦裁切機(CXY-100G辰興業)",
    KWHour: null,
  },
];

export const EQUIPMENT_TYPE_OPTIONS = [
  { value: "非生產設備", label: "非生產設備" },
  { value: "生產設備", label: "生產設備" },
];

export const WORK_AREA_OPTIONS = [
  { value: "車用廠(1F)", label: "車用廠(1F)" },
  { value: "車用廠(4F)", label: "車用廠(4F)" },
  { value: "中興廠", label: "中興廠" },
  { value: "(未設定)", label: "(未設定)" },
  { value: "總廠", label: "總廠" },
];

export const STATUS_OPTIONS = [
  { value: "使用中", label: "使用中" },
  { value: "報廢", label: "報廢" },
  { value: "停用", label: "停用" },
];

export const USAGE_GROUP_OPTIONS = [
  { value: "空調系統", label: "空調系統" },
  { value: "自動壓著機", label: "自動壓著機" },
  { value: "裁線機", label: "裁線機" },
  { value: "射出機", label: "射出機" },
  { value: "半自動壓著機", label: "半自動壓著機" },
  { value: "烘料機", label: "烘料機" },
  { value: "電測機", label: "電測機" },
  { value: "熱風槍", label: "熱風槍" },
  { value: "焊接系統", label: "焊接系統" },
  { value: "線材剝皮機", label: "線材剝皮機" },
  { value: "(未設定)", label: "(未設定)" },
  { value: "冰箱", label: "冰箱" },
  { value: "機房", label: "機房" },
  { value: "電梯", label: "電梯" },
  { value: "檯燈", label: "檯燈" },
  { value: "照明系統", label: "照明系統" },
  { value: "公務車", label: "公務車" },
  { value: "飲水機", label: "飲水機" },
  { value: "筆記型電腦", label: "筆記型電腦" },
  { value: "桌上型電腦", label: "桌上型電腦" },
  { value: "除濕機", label: "除濕機" },
  { value: "影印機", label: "影印機" },
  { value: "蒸飯箱", label: "蒸飯箱" },
  { value: "微波爐", label: "微波爐" },
];

export const MANUFACTURER_OPTIONS = [
  { value: "燃料油", label: "燃料油" },
  { value: "天然氣(自產)", label: "天然氣(自產)" },
  { value: "液化石油氣(LPG)", label: "液化石油氣(LPG)" },
  { value: "車用汽油", label: "車用汽油" },
  { value: "柴油", label: "柴油" },
  { value: "台電電力", label: "台電電力" },
  { value: "外購蒸汽", label: "外購蒸汽" },
  { value: "(未設定)", label: "(未設定)" },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { method, query } = req;

  switch (method) {
    case "GET":
      // If deviceReferences is requested
      if (query.type === "deviceReferences") {
        return res.status(200).json({ deviceReferences: mockDeviceReferences });
      }
      // Default equipment list
      return res.status(200).json({ equipments: mockEquipments });

    case "POST":
      const newEquipment: Equipment = {
        ...req.body,
        id: mockEquipments.length + 1,
      };
      mockEquipments.push(newEquipment);
      return res.status(201).json({ equipment: newEquipment });

    case "PUT":
      const updatedEquipment = req.body;
      const index = mockEquipments.findIndex(
        (e) => e.id === updatedEquipment.id
      );
      if (index !== -1) {
        mockEquipments[index] = updatedEquipment;
        return res.status(200).json({ equipment: updatedEquipment });
      }
      return res.status(404).json({ message: "Equipment not found" });

    case "DELETE":
      const idToDelete = query.id;
      const equipmentIndex = mockEquipments.findIndex(
        (e) => e.id === Number(idToDelete)
      );
      if (equipmentIndex !== -1) {
        mockEquipments.splice(equipmentIndex, 1);
        return res
          .status(200)
          .json({ message: "Equipment deleted successfully" });
      }
      return res.status(404).json({ message: "Equipment not found" });

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}
