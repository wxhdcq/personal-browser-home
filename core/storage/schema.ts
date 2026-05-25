import { storageKeys } from "@/data/storageKeys";

export const appDataSchemaVersion = 1;

export interface AppDataBackupV1 {
  app: "personal-browser-home";
  schemaVersion: 1;
  exportedAt: string;
  records: Record<string, string | null>;
}

export type AppDataBackup = AppDataBackupV1;

type LegacyBackup = Record<string, string | null>;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRecords(value: unknown): Record<string, string | null> {
  if (!isObject(value)) return {};

  return Object.fromEntries(
    Object.values(storageKeys).map((key) => {
      const item = value[key];
      return [key, item === null || typeof item === "string" ? item : null];
    }),
  );
}

function isV1Backup(value: unknown): value is AppDataBackupV1 {
  return (
    isObject(value) &&
    value.app === "personal-browser-home" &&
    value.schemaVersion === 1 &&
    isObject(value.records)
  );
}

export function createAppDataBackup(
  records: Record<string, string | null>,
): AppDataBackupV1 {
  return {
    app: "personal-browser-home",
    schemaVersion: appDataSchemaVersion,
    exportedAt: new Date().toISOString(),
    records: normalizeRecords(records),
  };
}

export function migrateAppDataBackup(input: unknown): AppDataBackupV1 {
  if (isV1Backup(input)) {
    return createAppDataBackup(input.records);
  }

  return createAppDataBackup(input as LegacyBackup);
}
