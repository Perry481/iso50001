import type {
  ENB,
  BaselineData,
  RegressionData,
  ComparisonData,
  ChartData,
} from "./types";

export async function getENBs(company: string): Promise<{
  data: ENB[];
  targetItems: string[];
  energyTypes: string[];
  workAreas: string[];
  sharedGroups: string[];
  lockedStates: string[];
}> {
  if (!company) {
    return {
      data: [],
      targetItems: [],
      energyTypes: [],
      workAreas: [],
      sharedGroups: [],
      lockedStates: [],
    };
  }

  const response = await fetch(`/api/enb?company=${company}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch ENBs");
  }

  return data;
}

export async function getENBDetails(
  company: string,
  ebSgt: number,
  feature?: string
): Promise<{
  baselineDetails: BaselineData[];
  regressionData?: RegressionData;
  comparisonData?: ComparisonData[];
  chartData?: ChartData;
}> {
  if (!company || !ebSgt) {
    return { baselineDetails: [] };
  }

  const url = new URL("/api/enb", window.location.origin);
  url.searchParams.append("company", company);
  url.searchParams.append("ebSgt", ebSgt.toString());
  if (feature) {
    url.searchParams.append("feature", feature);
  }

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch ENB details");
  }

  return data;
}

export async function getBaselineList(
  schema: string
): Promise<Record<string, string>> {
  try {
    const response = await fetch(
      `https://esg.jtmes.net/OptonSetup/GetEnergyPerformanceIndex.ashx?schema=${schema}&selecttype=baselinelist`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch baseline list:", error);
    return {};
  }
}
