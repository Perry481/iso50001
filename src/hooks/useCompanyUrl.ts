import { useCompany } from "@/contexts/CompanyContext";

export function useCompanyUrl() {
  const { companyName } = useCompany();

  const buildUrl = (path: string) => {
    if (process.env.NODE_ENV === "development") {
      return path;
    }

    // Remove leading slash and clean the path
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;

    // If the path already includes iso50001, just ensure company prefix
    if (cleanPath.includes("iso50001")) {
      return `/${companyName}/${cleanPath}`;
    }

    // For other paths, add both company and iso50001
    return `/${companyName}/iso50001/${cleanPath}`;
  };

  return { buildUrl };
}
