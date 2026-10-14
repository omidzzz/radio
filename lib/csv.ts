/**
 * CSV export utilities for admin dashboard.
 */

/**
 * Convert an array of objects to CSV string.
 */
export function toCsv<T extends object>(
  rows: T[],
  columns: { key: string; label: string }[]
): string {
  if (rows.length === 0) {
    return columns.map((c) => c.label).join(",") + "\n";
  }

  const header = columns.map((c) => c.label).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const value = (row as Record<string, unknown>)[col.key];
          if (value === null || value === undefined) return "";
          const str = String(value);
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    )
    .join("\n");

  return `${header}\n${body}\n`;
}

/**
 * Trigger a browser download of a CSV file.
 */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}