/**
 * Utility functions to dynamically determine the latest available performance month and year
 * from existing performance and period records.
 */

export const MONTH_NAMES: string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_INDEX_MAP: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

export interface ParsedDateInfo {
  year: number;
  monthIndex: number;
  monthName: string;
  day: number;
  score: number; // e.g. 20260915 for 15 Sep 2026
}

/**
 * Extracts and parses date information from any performance record or period
 */
export function parseRecordDateInfo(record: any): ParsedDateInfo | null {
  if (!record || typeof record !== 'object') return null;

  // 1. Direct explicit entryDate (e.g. '2026-09-15' or ISO date)
  if (record.entryDate && typeof record.entryDate === 'string') {
    const raw = record.entryDate.trim();
    const parts = raw.split('T')[0].split('-');
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parts[2] ? parseInt(parts[2], 10) : 1;
      if (!isNaN(y) && y > 2000 && !isNaN(m) && m >= 0 && m <= 11) {
        return {
          year: y,
          monthIndex: m,
          monthName: MONTH_NAMES[m],
          day: isNaN(d) ? 1 : d,
          score: y * 10000 + (m + 1) * 100 + (isNaN(d) ? 1 : d),
        };
      }
    }
  }

  // 2. Specific week date boundaries (e.g. weekEndDate, weekStartDate, endDate, startDate)
  const boundaryDate = record.weekEndDate || record.endDate || record.weekStartDate || record.startDate;
  if (boundaryDate && typeof boundaryDate === 'string' && boundaryDate.includes('-')) {
    const raw = boundaryDate.trim();
    const parts = raw.split('T')[0].split('-');
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parts[2] ? parseInt(parts[2], 10) : 1;
      if (!isNaN(y) && y > 2000 && !isNaN(m) && m >= 0 && m <= 11) {
        return {
          year: y,
          monthIndex: m,
          monthName: MONTH_NAMES[m],
          day: isNaN(d) ? 1 : d,
          score: y * 10000 + (m + 1) * 100 + (isNaN(d) ? 1 : d),
        };
      }
    }
  }

  // 3. Explicit month and year fields
  if (record.month && record.year) {
    const cleanMonth = String(record.month).trim().toLowerCase();
    const monthIdx = MONTH_INDEX_MAP[cleanMonth];
    const y = Number(record.year);
    if (monthIdx !== undefined && !isNaN(y) && y > 2000) {
      let day = 1;
      const weekVal = record.week || record.weekName;
      if (weekVal) {
        const match = String(weekVal).match(/\d+/);
        if (match) {
          const weekNum = parseInt(match[0], 10);
          day = Math.min(Math.max((weekNum - 1) * 7 + 1, 1), 31);
        }
      }
      return {
        year: y,
        monthIndex: monthIdx,
        monthName: MONTH_NAMES[monthIdx],
        day,
        score: y * 10000 + (monthIdx + 1) * 100 + day,
      };
    }
  }

  // 4. Fallback to createdAt or updatedAt timestamp
  const timestamp = record.createdAt || record.updatedAt;
  if (timestamp && typeof timestamp === 'string' && timestamp.includes('-')) {
    const parts = timestamp.split('T')[0].split('-');
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parts[2] ? parseInt(parts[2], 10) : 1;
      if (!isNaN(y) && y > 2000 && !isNaN(m) && m >= 0 && m <= 11) {
        return {
          year: y,
          monthIndex: m,
          monthName: MONTH_NAMES[m],
          day: isNaN(d) ? 1 : d,
          score: y * 10000 + (m + 1) * 100 + (isNaN(d) ? 1 : d),
        };
      }
    }
  }

  return null;
}

/**
 * Automatically determine the latest month and year available in a given set of records.
 * Returns null if no valid date information exists.
 */
export function getLatestMonthAndYear(
  records: any[]
): { month: string; year: number } | null {
  if (!records || records.length === 0) return null;

  let best: ParsedDateInfo | null = null;

  for (const rec of records) {
    const info = parseRecordDateInfo(rec);
    if (!info) continue;
    if (!best || info.score > best.score) {
      best = info;
    }
  }

  if (!best) return null;

  return {
    month: best.monthName,
    year: best.year,
  };
}

/**
 * Compute available months and years from records and periods, sorted logically.
 */
export function getAvailableMonthsAndYears(
  records: any[] = [],
  periods: any[] = []
): { availableMonths: string[]; availableYears: number[] } {
  const monthsInUse = new Set<string>();
  const yearsInUse = new Set<number>();

  const processItem = (item: any) => {
    const info = parseRecordDateInfo(item);
    if (info) {
      monthsInUse.add(info.monthName);
      yearsInUse.add(info.year);
    } else {
      if (item?.month && typeof item.month === 'string') {
        const idx = MONTH_INDEX_MAP[item.month.trim().toLowerCase()];
        if (idx !== undefined) {
          monthsInUse.add(MONTH_NAMES[idx]);
        }
      }
      if (item?.year && !isNaN(Number(item.year))) {
        yearsInUse.add(Number(item.year));
      }
    }
  };

  records.forEach(processItem);
  periods.forEach(processItem);

  // If years is empty, provide current year and surrounding
  if (yearsInUse.size === 0) {
    yearsInUse.add(new Date().getFullYear());
  }

  // If there are months in use, sort them in calendar order
  const availableMonths = MONTH_NAMES.filter((m) => monthsInUse.has(m));

  // If no months have data yet, include all 12 calendar months so user can select
  const finalMonths = availableMonths.length > 0 ? availableMonths : [...MONTH_NAMES];

  const availableYears = Array.from(yearsInUse).sort((a, b) => b - a);

  return {
    availableMonths: finalMonths,
    availableYears,
  };
}
