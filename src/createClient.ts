import { NexusConfig } from "./types";

export async function createNexusClient(
  config: NexusConfig,
  userData: { email: string; name?: string; externalId: string }
): Promise<{ success: boolean; nexusClientSlug?: string; error?: string }> {
  try {
    const url = new URL(`${config.endpoint}/clients`);
    url.searchParams.append("project", config.projectSlug);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: `nota-facil-${userData.externalId}`,
        name: userData.name || userData.email.split("@")[0],
        email: userData.email,
        externalId: userData.externalId,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return { success: false, error: err.message || "Erro ao criar cliente no Nexus" };
    }

    const data = await response.json();
    return { success: true, nexusClientSlug: data.slug };
  } catch (err) {
    return { success: false, error: "Falha na conexão com Nexus" };
  }
}
