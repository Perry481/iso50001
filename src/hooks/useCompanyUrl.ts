// hooks/useCompanyUrl.ts
import { useCompany } from "@/contexts/CompanyContext";
import { useRouter } from "next/router";

export function useCompanyUrl() {
  const { companyName } = useCompany();
  const router = useRouter();

  const buildUrl = (path: string) => {
    // Clean the path - remove leading slash if present
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;

    // In development
    if (process.env.NODE_ENV === "development") {
      // Ensure path starts with /iso50001
      return `/iso50001/${cleanPath}`;
    }

    // In production
    // Ensure path includes company and basePath
    return `/${companyName}/iso50001/${cleanPath}`;
  };

  // Add a navigate function to handle page transitions smoothly
  const navigate = (path: string) => {
    const url = buildUrl(path);
    // Use shallow navigation to minimize page reloads
    router.push(url, undefined, { shallow: true });
  };

  return { buildUrl, navigate };
}
