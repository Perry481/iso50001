export interface Report {
  reviewerId: string;
  title: string;
  startDate: string;
  endDate: string;
  eeSgt: number;
}

export interface Detail {
  id?: string | number;
  name: string;
  type: string;
  group: string;
  area: string;
  department: string;
  workHours?: number;
  workDays?: number;
  loadFactor?: number;
  quantity?: number;
  totalHours: number;
  kwPerHour: number;
  actualEnergy: number;
  actualConsumption?: number;
  startDate: string;
  endDate: string;
  dataQuality: 1 | 2 | 3;
  performanceEvaluation:
    | "不合格"
    | "正在改善"
    | "正在改善中"
    | "初評具潛力"
    | "不確定"
    | "良好";
}
