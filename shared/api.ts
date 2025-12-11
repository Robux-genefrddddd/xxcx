/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Premium Key schema with validation and metadata
 */
export interface PremiumKeyData {
  key: string;
  status: "unused" | "used";
  type: "monthly" | "yearly" | "lifetime";
  maxEmojis?: number;
  assignedTo?: string;
  assignedEmail?: string;
  createdAt: string;
  usedAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdBy: string;
}

/**
 * Maintenance mode configuration
 */
export type MaintenanceMode = "modal" | "fullscreen" | "banner";

export interface MaintenanceConfig {
  enabled: boolean;
  message: string;
  mode: MaintenanceMode;
  lastUpdated: string;
}
