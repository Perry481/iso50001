import { useCompany } from "@/contexts/CompanyContext";

export function useCompanyUrl() {
  const { companyName } = useCompany();

  const buildUrl = (path: string) => {
    // Clean the path
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;

    // Handle empty path
    if (!cleanPath) {
      return process.env.NODE_ENV === "development"
        ? `/iso50001`
        : `/${companyName}/iso50001`;
    }

    // IMPORTANT: Always maintain company path in production
    if (process.env.NODE_ENV === "production") {
      return `/${companyName}/iso50001/${cleanPath}`;
    }

    // For development
    return `/iso50001/${cleanPath}`;
  };

  return { buildUrl };
}
