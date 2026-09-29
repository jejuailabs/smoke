export const maxArchiveBytes = 100 * 1024 * 1024;
export type ArchivePreflight = "ready_for_worker_scan" | "missing_file" | "file_too_large" | "invalid_zip_header";

export function checkArchivePreflight(name: string, size: number, header: Uint8Array): ArchivePreflight {
  if (!name || !Number.isInteger(size) || size <= 0) return "missing_file";
  if (size > maxArchiveBytes) return "file_too_large";
  if (!name.toLowerCase().endsWith(".zip") || header.length < 4 || header[0] !== 0x50 || header[1] !== 0x4b || header[2] !== 0x03 || header[3] !== 0x04) return "invalid_zip_header";
  return "ready_for_worker_scan";
}
