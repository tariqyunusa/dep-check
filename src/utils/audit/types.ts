export interface AuditResult {
  package: string;
  severity: "info" | "warn" | "error";
  message: string;
  fix?: string;
}