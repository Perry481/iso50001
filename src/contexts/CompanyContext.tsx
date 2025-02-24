import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
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

export function CompanyProvider({ children }: CompanyProviderProps) {
  const [isSchemaInitialized, setIsSchemaInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This value will be replaced with dynamic data in the future
  const companyName = "ebc";

  useEffect(() => {
    async function initializeSchema() {
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
        } else {
          setError(data.message || "Failed to initialize schema");
        }
      } catch {
        setError("Failed to connect to schema initialization service");
      } finally {
        setIsLoading(false);
      }
    }

    initializeSchema();
  }, [companyName]);

  const value = {
    companyName,
    isSchemaInitialized,
    isLoading,
    error,
  };

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
