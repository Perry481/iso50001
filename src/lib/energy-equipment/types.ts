export interface Equipment {
  id: string;
  code: string;
  name: string;
  referenceCode?: string;
  manufacturer: string;
  equipmentType: string;
  workArea: string;
  workAreaName: string;
  department: string;
  usageGroup: string;
  usageGroupName: string;
  status: string;
  ratedPower?: number;
  actualPower?: number;
  powerUnit: string;
  assetNumber?: string;
  quantity: number;
  note?: string;
  EceSgt?: number;
}

export interface RawEquipment {
  EnergyEquipmentID: string;
  EnergyEquipmentName: string;
  EnergyTypeID: string;
  EnergyTypeName: string;
  UnitName: string;
  EnergyEquipmentTypeID: string;
  EnergyGroupID: string;
  EnergyGroupName: string;
  EnergyAreaID: string;
  EnergyAreaName: string;
  DepartName: string | null;
  ConsumptionRatio: number;
  AssetID: string | null;
  MachineID: string;
  Quantity: number;
  Remark: string;
  StatusType: number;
  RealConsumption: number | null;
}

export const EQUIPMENT_TYPE_OPTIONS = [
  { value: "生產設備", label: "生產設備" },
  { value: "非生產設備", label: "非生產設備" },
] as const;

export const STATUS_OPTIONS = [
  { value: "使用中", label: "使用中" },
  { value: "停用", label: "停用" },
  { value: "報廢", label: "報廢" },
] as const;

export function mapStatusType(statusType: number): string {
  switch (statusType) {
    case 1:
      return "使用中";
    case 2:
      return "停用";
    case 3:
      return "報廢";
    default:
      return "使用中";
  }
}

export function mapEquipmentType(typeId: string): string {
  switch (typeId) {
    case "A":
      return "生產設備";
    case "C":
      return "非生產設備";
    default:
      return "生產設備";
  }
}
