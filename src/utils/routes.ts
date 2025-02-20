export const getBasePath = () => {
  if (process.env.NODE_ENV === "development") {
    return "";
  }

  if (typeof window !== "undefined") {
    const pathParts = window.location.pathname.split("/");
    // Find first non-empty part that's not a special route
    const companyName = pathParts.find(
      (part) => part && part.length > 0 && !["_next", "api"].includes(part)
    );

    if (companyName) {
      return `/${companyName}`;
    }
  }

  return "";
};

export const createPath = (path: string) => {
  const base = getBasePath();
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // If it's the root path, just return the base
  if (path === "/") return base || "/";

  // Combine base path with cleaned path
  return base ? `${base}/${cleanPath}` : `/${cleanPath}`;
};

// Helper function to get the clean path without company name
export const getCleanPath = (path: string) => {
  const base = getBasePath();
  if (!base) return path;
  return path.replace(base, "") || "/";
};
