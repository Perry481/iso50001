export interface EnergyBaseline {
  id: number;
  name: string;
  remark: string;
  sourceType: string;
  energyTypeId: string;
  eceSgt: number | null;
  groupId: string;
  areaId: string;
  useX1: boolean;
  useX2: boolean;
  useX3: boolean;
  useX4: boolean;
  useX5: boolean;
  isLocked: boolean;
  createdTime: string;
  updatedTime: string;
  ratio0: number | null;
  ratio1: number | null;
  ratio2: number | null;
  ratio3: number | null;
  ratio4: number | null;
  ratio5: number | null;
  captionX1: string | null;
  captionX2: string | null;
  captionX3: string | null;
  captionX4: string | null;
  captionX5: string | null;
  unitX1: string | null;
  unitX2: string | null;
  unitX3: string | null;
  unitX4: string | null;
  unitX5: string | null;
}

export interface ApiEnergyBaselineResponse {
  page: number;
  total: number;
  records: number;
  rows: Array<{
    EbSgt: number;
    EnergyBaselineName: string;
    Remark: string;
    SourceTypeCode: string;
    EnergyTypeID: string;
    EceSgt: number | null;
    EnergyGroupID: string;
    EnergyAreaID: string;
    UseX1: boolean;
    UseX2: boolean;
    UseX3: boolean;
    UseX4: boolean;
    UseX5: boolean;
    IsLock: boolean;
    CreatedTime: string;
    UpdatedTime: string;
    Ratio0: number | null;
    Ratio1: number | null;
    Ratio2: number | null;
    Ratio3: number | null;
    Ratio4: number | null;
    Ratio5: number | null;
    CaptionX1: string | null;
    CaptionX2: string | null;
    CaptionX3: string | null;
    CaptionX4: string | null;
    CaptionX5: string | null;
    UnitX1: string | null;
    UnitX2: string | null;
    UnitX3: string | null;
    UnitX4: string | null;
    UnitX5: string | null;
  }>;
}
