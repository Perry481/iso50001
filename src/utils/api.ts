// utils/api.ts
export const createApiUrl = (path: string) => {
  const basePath = process.env.NODE_ENV === "development" ? "" : "/iso50001";
  return `${basePath}${path}`;
};
