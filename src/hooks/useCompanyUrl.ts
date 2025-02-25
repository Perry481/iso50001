import { useCompany } from "@/contexts/CompanyContext";

export function useCompanyUrl() {
  const { companyName } = useCompany();

  const buildUrl = (path: string) => {
    if (process.env.NODE_ENV === "development") {
      return path;
    }
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `/${companyName}/iso50001/${cleanPath}`;
  };

  return { buildUrl };
}
