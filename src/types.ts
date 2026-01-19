export interface AccessStatus {
  allowed: boolean;
  paymentUrl?: string;
  lastCheck: number;
}

export interface NexusConfig {
  endpoint: string;
  clientSlug: string;
  projectSlug: string;
  siteUrl: string;
}
