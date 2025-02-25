import { useCompany } from "@/contexts/CompanyContext";

export function useCompanyUrl() {
  const { companyName } = useCompany();

  const buildUrl = (path: string) => {
    // Clean the path
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;

    // In development, preserve the iso50001 path structure
    if (process.env.NODE_ENV === "development") {
      return `/iso50001/${cleanPath}`;
    }

    // In production, use the company/iso50001 structure
    return `/${companyName}/iso50001/${cleanPath}`;
  };

  return { buildUrl };
}
