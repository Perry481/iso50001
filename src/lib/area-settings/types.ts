export interface Area {
  id: string;
  code: string;
  name: string;
  department: string;
  meterNumber?: string;
  note?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export const EQUIPMENT_TYPE_OPTIONS: SelectOption[] = [
  { value: "非生產設備", label: "非生產設備" },
  { value: "生產設備", label: "生產設備" },
];

export const WORK_AREA_OPTIONS: SelectOption[] = [
  { value: "車用廠(1F)", label: "車用廠(1F)" },
  { value: "車用廠(4F)", label: "車用廠(4F)" },
  { value: "中興廠", label: "中興廠" },
  { value: "(未設定)", label: "(未設定)" },
  { value: "總廠", label: "總廠" },
];

export const STATUS_OPTIONS: SelectOption[] = [
  { value: "使用中", label: "使用中" },
  { value: "報廢", label: "報廢" },
  { value: "停用", label: "停用" },
];

export const USAGE_GROUP_OPTIONS: SelectOption[] = [
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

export const MANUFACTURER_OPTIONS: SelectOption[] = [
  { value: "燃料油", label: "燃料油" },
  { value: "天然氣(自產)", label: "天然氣(自產)" },
  { value: "液化石油氣(LPG)", label: "液化石油氣(LPG)" },
  { value: "車用汽油", label: "車用汽油" },
  { value: "柴油", label: "柴油" },
  { value: "台電電力", label: "台電電力" },
  { value: "外購蒸汽", label: "外購蒸汽" },
  { value: "(未設定)", label: "(未設定)" },
];
