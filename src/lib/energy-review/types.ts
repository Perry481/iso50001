// src/lib/energy-ecf/types.ts
export type Report = {
  title: string;
  reviewerId: string;
  startDate: string;
  endDate: string;
};

export interface Detail {
  id: number;
  name: string;
  type: string;
  group: string;
  area: string;
  department: string;
  workHours: number | undefined;
  workDays: number | undefined;
  loadFactor: number | undefined;
  quantity: number | undefined;
  totalHours: number;
  kwPerHour: number;
  actualEnergy: number;
  actualConsumption: number | undefined;
  startDate: string;
  endDate: string;
  dataQuality: number;
  performanceEvaluation: string;
}
