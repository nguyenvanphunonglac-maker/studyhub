import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanObject<T extends object>(obj: T): T {
  const result = { ...obj };
  Object.keys(result).forEach((key) => {
    if (result[key as keyof T] === undefined) {
      delete result[key as keyof T];
    }
  });
  return result;
}
export function downloadCsvFile(filename: string, headers: string[], rows: string[][]) {
  const escapeValue = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [headers.map(escapeValue).join(','), ...rows.map((row) => row.map(escapeValue).join(','))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
