import appConfig from "@/config/config.json";

export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const { baseUrl, version } = appConfig.api;
  return `${baseUrl.replace(/\/$/, "")}/api/${version}`;
}
