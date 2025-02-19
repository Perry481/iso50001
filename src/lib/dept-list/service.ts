import type { Dept } from "./types";

class DeptListService {
  async getDepts(): Promise<Dept[]> {
    const response = await fetch("/api/dept-list");
    if (!response.ok) throw new Error("Failed to fetch departments");
    const data = await response.json();
    return data.depts;
  }
}

export const deptListService = new DeptListService();
