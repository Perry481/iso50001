import type { EnergyBaseline, ApiEnergyBaselineResponse } from "./types";

class EnergyBaselineService {
  private baseUrl = "http://192.168.0.55:8080/SystemOptions";

  async getBaselines(): Promise<EnergyBaseline[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/GetEnergyBaselineMain.ashx?rows=1000&page=1&sidx=EbSgt&sord=asc`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch energy baselines");
      }

      const data: ApiEnergyBaselineResponse = await response.json();

      return data.rows.map((row) => ({
        id: row.EbSgt,
        name: row.EnergyBaselineName,
        remark: row.Remark,
        sourceType: row.SourceTypeCode,
        energyTypeId: row.EnergyTypeID,
        eceSgt: row.EceSgt,
        groupId: row.EnergyGroupID,
        areaId: row.EnergyAreaID,
        useX1: row.UseX1,
        useX2: row.UseX2,
        useX3: row.UseX3,
        useX4: row.UseX4,
        useX5: row.UseX5,
        isLocked: row.IsLock,
        createdTime: row.CreatedTime,
        updatedTime: row.UpdatedTime,
        ratio0: row.Ratio0,
        ratio1: row.Ratio1,
        ratio2: row.Ratio2,
        ratio3: row.Ratio3,
        ratio4: row.Ratio4,
        ratio5: row.Ratio5,
        captionX1: row.CaptionX1,
        captionX2: row.CaptionX2,
        captionX3: row.CaptionX3,
        captionX4: row.CaptionX4,
        captionX5: row.CaptionX5,
        unitX1: row.UnitX1,
        unitX2: row.UnitX2,
        unitX3: row.UnitX3,
        unitX4: row.UnitX4,
        unitX5: row.UnitX5,
      }));
    } catch (error) {
      console.error("Failed to fetch energy baselines:", error);
      throw error;
    }
  }
}
export const energyBaselineService = new EnergyBaselineService();
