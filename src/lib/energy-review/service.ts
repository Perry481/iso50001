// src/lib/energy-ecf/service.ts
import { Report, Detail } from "./types";

class EnergyECFService {
  async getReports(): Promise<Report[]> {
    const response = await fetch("/api/energy-review");
    if (!response.ok) throw new Error("Failed to fetch reports");
    const data = await response.json();
    return data.reports;
  }

  async getReportDetails(reportTitle: string): Promise<Detail[]> {
    const response = await fetch(
      `/api/energy-review?title=${encodeURIComponent(reportTitle)}`
    );
    if (!response.ok) throw new Error("Failed to fetch report details");
    const data = await response.json();
    return data.details;
  }

  async createReport(report: Report): Promise<void> {
    const response = await fetch("/api/energy-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "report", data: report }),
    });
    if (!response.ok) throw new Error("Failed to create report");
  }

  async deleteReport(reportTitle: string): Promise<void> {
    const response = await fetch(
      `/api/energy-review?title=${encodeURIComponent(reportTitle)}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("Failed to delete report");
  }

  async updateReport(
    reportTitle: string,
    report: Partial<Report>
  ): Promise<void> {
    const response = await fetch("/api/energy-review", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "report", data: report }),
    });
    if (!response.ok) throw new Error("Failed to update report");
  }
}

export const energyECFService = new EnergyECFService();
