import { useCompany } from "@/contexts/CompanyContext";

export function useCompanyUrl() {
  const { companyName } = useCompany();

  const buildUrl = (path: string) => {
    if (!path) return `/${companyName}/iso50001`;

    // Clean the path - remove leading slash and iso50001 if present
    let cleanPath = path.startsWith("/") ? path.slice(1) : path;
    cleanPath = cleanPath.startsWith("iso50001/")
      ? cleanPath.slice(9)
      : cleanPath;

    // Ensure we don't have empty paths
    if (!cleanPath) return `/${companyName}/iso50001`;

    // In development mode
    if (process.env.NODE_ENV === "development") {
      return `/iso50001/${cleanPath}`;
    }

    // In production with company
    return `/${companyName}/iso50001/${cleanPath}`;
  };

  return { buildUrl };
}
