/**
 * Gets the base path from Next.js config or environment
 */
export function getBasePath(): string {
  // In production, use the NEXT_PUBLIC_BASE_PATH env variable if set
  if (process.env.NEXT_PUBLIC_BASE_PATH) {
    return process.env.NEXT_PUBLIC_BASE_PATH;
  }
  // For local development and if no env variable is set
  return "/iso50001";
}

/**
 * Creates a full API URL with the correct base path
 */
export function getApiUrl(path: string): string {
  const basePath = getBasePath();
  // Remove any leading slash from the path to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${basePath}/api/${cleanPath}`;
}
