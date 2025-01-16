export interface EnergySubject {
  EnergyGroupID: string;
  EnergyGroupName: string;
  Remark: string;
  CreatedTime: string | null;
  UpdatedTime: string | null;
}

export interface RawApiResponse {
  total: number;
  page: number;
  records: number;
  rows: EnergySubject[];
}
