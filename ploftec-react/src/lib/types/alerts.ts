export type AlertSeverity = "critical" | "high" | "warning" | "info" | string;

export type AlertChannel = "modal" | "toast" | "banner" | string;

export interface AlertCta {
  label: string;
  href: string;
}

export interface ForumAlertPayload {
  requestId?: Array<string | number>;
  expiresAt?: Array<string>;
  noSlots?: Array<string | number>;
  lastSlotEnd?: Array<string>;
  [key: string]: unknown;
}

export interface ForumAlert {
  id: string;
  dedupeKey?: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  createdAt: string;
  expiresAt?: string;
  sticky?: boolean;
  cta?: AlertCta | null;
  channelSuggested?: AlertChannel;
  data?: ForumAlertPayload | null;
}
