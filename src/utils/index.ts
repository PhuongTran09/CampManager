/**
  * Converts YYYY-MM-DD string to DD/MM/YYYY
  */
export function formatDateVN(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  // If already in DD/MM/YYYY format or contains slashes
  if (dateStr.includes('/')) return dateStr;

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (year.length === 4) {
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
  }
  return dateStr;
}

/**
 * Calculates expected farrow date (plus 114 days) and returns YYYY-MM-DD
 */
export function addDays(dateStr: string, days: number = 114): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
