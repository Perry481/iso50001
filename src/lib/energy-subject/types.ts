export interface EnergySubject {
  id?: string | number;
  code: string;
  name: string;
  note?: string;
}

export interface RawApiResponse {
  page: number;
  total: number;
  records: number;
  rows: RawSubjectData[];
}

export interface RawSubjectData {
  EnergyGroupID: string;
  EnergyGroupName: string;
  Remark: string | null;
  CreatedTime: string | null;
  UpdatedTime: string | null;
}
