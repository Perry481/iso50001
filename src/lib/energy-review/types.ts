// src/lib/energy-ecf/types.ts
export type Report = {
  title: string;
  reviewerId: string;
  startDate: string;
  endDate: string;
};

export type Detail = {
  id: number;
  name: string;
  type: string;
  group: string;
  area: string;
  department?: string;
  workHours: number;
  workDays: number;
  dailyHours?: number;
  workingDays?: number;
  totalHours: number;
  kwPerHour: number;
  actualEnergy: number;
  actualConsumption?: number;
  startDate: string;
  endDate: string;
  dataQuality: number;
  performanceEvaluation: string;
};
