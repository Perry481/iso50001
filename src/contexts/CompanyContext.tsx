import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { getApiUrl } from "@/lib/utils/api";

interface CompanyContextType {
  companyName: string;
  isSchemaInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

interface CompanyProviderProps {
  children: ReactNode;
}

function LoadingCard() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#f8f9fa] z-[9999]">
      <div className="bg-white rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.1)] p-8 flex flex-col items-center gap-6 max-w-[90%] w-[400px]">
        <h2 className="text-2xl font-medium text-primary m-0">
          Iso50001能耗管理
        </h2>
        <div className="w-[50px] h-[50px] border-3 border-[#f3f3f3] border-t-primary rounded-full animate-[spin_1s_linear_infinite]" />
        <div className="text-muted-foreground text-base text-center">
          正在載入公司資料...
        </div>
      </div>
    </div>
  );
}

function NoCompanyCard() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#f8f9fa] z-[9999]">
      <div className="bg-white rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.1)] p-8 flex flex-col items-center gap-6 max-w-[90%] w-[400px]">
        <h2 className="text-2xl font-medium text-destructive m-0">無法存取</h2>
        <div className="text-muted-foreground text-base text-center">
          無法取得公司資料。此系統需要正確的公司資訊才能運作。
          <br />
          <br />
          請確認您的URL包含正確的公司代號，或聯絡系統管理員。
        </div>
      </div>
    </div>
  );
}

function getCompanyName(pathname: string | null): string {
  if (!pathname) return "";
  const match = pathname.match(/^\/([^/]+)\/iso50001/);
  return match ? match[1] : "";
}

export function CompanyProvider({ children }: CompanyProviderProps) {
  const [isSchemaInitialized, setIsSchemaInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const pathname = usePathname();

  // Get company name based on environment
  const companyName = getCompanyName(pathname);

  useEffect(() => {
    // If we've already initialized this company, don't show loading again
    if (initialized && companyName) {
      setIsLoading(false);
      return;
    }

    async function initializeSchema() {
      if (!companyName) {
        setError("Company name is required");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(getApiUrl("setup-schema"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ companyName }),
        });

        const data = await response.json();

        if (data.success) {
          setIsSchemaInitialized(true);
          setError(null);
          // Mark as initialized so we don't reload on page navigation
          setInitialized(true);
        } else {
          setError(data.message || "Failed to initialize schema");
        }
      } catch {
        setError("Failed to connect to schema initialization service");
      } finally {
        setIsLoading(false);
      }
    }

    // Start initialization
    if (companyName) {
      initializeSchema();
    } else {
      setIsLoading(false);
    }
  }, [companyName, initialized]);

  const value = {
    companyName,
    isSchemaInitialized,
    isLoading,
    error,
  };

  // Show loading state while initializing
  if (isLoading) {
    return <LoadingCard />;
  }

  // Show error state if no company is provided (only in production)
  if (!companyName && process.env.NODE_ENV === "production") {
    return <NoCompanyCard />;
  }

  return (
    <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}
