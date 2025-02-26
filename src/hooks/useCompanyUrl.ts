// hooks/useCompanyUrl.ts
import { useCompany } from "@/contexts/CompanyContext";
import { useRouter } from "next/router";

export function useCompanyUrl() {
  const { companyName } = useCompany();
  const router = useRouter();

  const buildUrl = (path: string) => {
    // Clean the path
    let cleanPath = path;
    while (cleanPath.startsWith("//")) {
      cleanPath = cleanPath.substring(1);
    }

    if (!cleanPath.startsWith("/")) {
      cleanPath = `/${cleanPath}`;
    }

    // In development
    if (process.env.NODE_ENV === "development") {
      // Ensure path starts with /iso50001
      const devUrl = cleanPath.startsWith("/iso50001")
        ? cleanPath
        : `/iso50001${cleanPath}`;

      // Fix any double iso50001 issues
      return devUrl.replace(/\/iso50001\/iso50001\//g, "/iso50001/");
    }

    // In production
    // Ensure path includes company and basePath
    const prodUrl = cleanPath.startsWith("/iso50001")
      ? `/${companyName}${cleanPath}`
      : `/${companyName}/iso50001${cleanPath}`;

    // Fix any potential double paths
    return prodUrl.replace(/\/iso50001\/iso50001\//g, "/iso50001/");
  };

  // Add a navigate function to handle page transitions smoothly
  const navigate = (path: string) => {
    const url = buildUrl(path);
    console.log("Navigating to:", url); // Debug log

    // Use shallow: true to avoid unnecessary data fetching
    // Use replace: true to avoid browser history issues
    router.push(url, undefined, { shallow: true, scroll: false });
  };

  return { buildUrl, navigate };
}
