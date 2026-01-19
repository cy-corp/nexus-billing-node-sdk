import { NexusConfig, AccessStatus } from "./types";

const CACHE_KEY_PREFIX = "nexus_access_";

export async function checkAccess(
  config: NexusConfig,
  userSlug: string
): Promise<AccessStatus> {
  const cacheKey = `${CACHE_KEY_PREFIX}${userSlug}`;
  
  const cached = typeof localStorage !== 'undefined' ? localStorage.getItem(cacheKey) : null;

  if (cached) {
    try {
      const status: AccessStatus = JSON.parse(cached);
      const now = Date.now();
      if (now - status.lastCheck < 24 * 60 * 60 * 1000 && status.allowed) {
        return status;
      }
    } catch {}
  }

  try {
    const url = new URL(config.endpoint);
    url.searchParams.append("client", userSlug);
    url.searchParams.append("project", config.projectSlug);
    url.searchParams.append("redirect", config.siteUrl + "/dashboard");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    const newStatus: AccessStatus = {
      allowed: data.allowed ?? false,
      paymentUrl: data.paymentUrl,
      lastCheck: Date.now(),
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(cacheKey, JSON.stringify(newStatus));
    }
    
    return newStatus;
  } catch (error) {
    console.error("[NexusBilling] Access check failed:", error);

    if (cached) {
      try {
        const status = JSON.parse(cached);
        return { ...status, lastCheck: Date.now() };
      } catch {}
    }

    return { allowed: true, lastCheck: Date.now() };
  }
}
