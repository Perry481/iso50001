export interface ENB {
  baselineCode: string;
  targetItem: string;
  energyType: string;
  workArea: string;
  sharedGroup: string;
  locked: string;
  note: string;
  X1: string;
  X2: string;
  X3?: string;
  X4?: string;
  X5?: string;
  X1Unit?: string;
  X2Unit?: string;
  X3Unit?: string;
  X4Unit?: string;
  X5Unit?: string;
  ebSgt: number;
}

export interface BaselineData {
  id: number;
  date: string;
  value: number;
  X1: number;
  X2?: number;
  X3?: number;
  X4?: number;
  X5?: number;
  createdTime: string;
  updatedTime: string;
}

export interface RegressionData {
  quadratic: {
    a: number;
    b: number;
    c: number;
    y: string;
    rSquare: number;
  };
  linear: {
    X1Label: string;
    X2Label: string;
    X3Label: string;
    X1Coefficient: number;
    X2Coefficient: number;
    X3Coefficient: number;
    constant: number;
    equation: string;
    rSquare: number;
    MBE: number;
    MBEPercentage: number;
    MAE: number;
    MAEPercentage: number;
    RMSE: number;
    CvRMSE: number;
    maxError: number;
  };
}

export interface ComparisonData {
  date: string;
  actualValue: number;
  theoreticalValue: number;
}

export interface ChartData {
  scatterData: [number, number][];
  regressionLine: [number, number][];
  unit: string;
  caption: string;
}
