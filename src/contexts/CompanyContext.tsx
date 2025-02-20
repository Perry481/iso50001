import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { AlertCircle, Loader2 } from "lucide-react";

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

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999]">
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-[480px]">
          <div className="bg-card rounded-xl shadow-2xl p-16 border-[3px] border-border">
            <div className="flex flex-col items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-32">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <div className="flex flex-col items-center">
                <h2 className="text-3xl font-semibold tracking-tight text-primary mb-8">
                  ISO 50001
                </h2>
                <p className="text-base text-muted-foreground">
                  Initializing company data...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error Screen Component
function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999]">
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-[480px]">
          <div className="bg-card rounded-xl shadow-2xl p-16 border-[3px] border-border">
            <div className="flex flex-col items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 mb-32">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <div className="flex flex-col items-center">
                <h2 className="text-3xl font-semibold tracking-tight text-destructive mb-8">
                  Access Error
                </h2>
                <div className="flex flex-col items-center gap-4">
                  <p className="text-base text-muted-foreground">{message}</p>
                  <p className="text-base text-muted-foreground">
                    Please access through the main platform or contact support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompanyProvider({ children }: CompanyProviderProps) {
  const [companyName, setCompanyName] = useState<string>("");
  const [isSchemaInitialized, setIsSchemaInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    async function detectCompanyName() {
      // For development mode
      if (process.env.NODE_ENV === "development") {
        setCompanyName("ebc");
        return;
      }

      // Get company name from URL path
      const pathParts = window.location.pathname.split("/");
      // Find first non-empty part that's not 'iso50001'
      const companyFromPath = pathParts.find(
        (part) => part && part !== "iso50001"
      );

      if (companyFromPath) {
        setCompanyName(companyFromPath);
      } else {
        setError("No company name provided");
      }
    }

    detectCompanyName();
  }, []);

  useEffect(() => {
    if (!companyName) return;

    async function initializeSchema() {
      try {
        const response = await fetch("/api/setup-schema", {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || showLoading) {
    return <LoadingScreen />;
  }

  if (error || !companyName) {
    return <ErrorScreen message={error || "No company name provided"} />;
  }

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
