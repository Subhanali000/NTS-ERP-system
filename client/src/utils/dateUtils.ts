import {
  format,
  parseISO,
  differenceInDays,
  isToday,
  isYesterday,
  isTomorrow,
  isValid,
} from 'date-fns';

/**
 * Safely converts a string or Date into a valid Date object.
 */
const toDateObject = (date: string | Date): Date => {
  if (typeof date === 'string') {
    const parsed = parseISO(date);
    if (!isValid(parsed)) throw new Error(`Invalid date string: ${date}`);
    return parsed;
  }
  if (!isValid(date)) throw new Error('Invalid Date object');
  return date;
};

/**
 * Format date as 'MMM dd, yyyy' (e.g., Jan 01, 2025).
 */
export const formatDate = (date: string | Date): string => {
  try {
    return format(toDateObject(date), 'MMM dd, yyyy');
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Format date and time as 'MMM dd, yyyy HH:mm'.
 */
export const formatDateTime = (date: string | Date): string => {
  try {
    return format(toDateObject(date), 'MMM dd, yyyy HH:mm');
  } catch {
    return 'Invalid DateTime';
  }
};

/**
 * Format a time string (HH:mm) to 12-hour format with AM/PM.
 */
export const formatTime = (time: string): string => {
  try {
    const [hoursStr, minutesStr] = time.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes)) return 'Invalid Time';

    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;

    return `${displayHour}:${String(minutes).padStart(2, '0')} ${ampm}`;
  } catch {
    return 'Invalid Time';
  }
};

/**
 * Get a relative label for a given date (e.g., Today, Yesterday, or formatted date).
 */
export const getRelativeDate = (date: string | Date): string => {
  try {
    const d = toDateObject(date);

    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    if (isTomorrow(d)) return 'Tomorrow';

    return formatDate(d);
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Get number of days remaining until a deadline.
 */
export const getDaysUntilDeadline = (dueDate: string | Date): number => {
  try {
    const targetDate = toDateObject(dueDate);
    return differenceInDays(targetDate, new Date());
  } catch {
    return NaN;
  }
};

/**
 * Check if a due date has passed.
 */
export const isOverdue = (dueDate: string | Date): boolean => {
  try {
    const targetDate = toDateObject(dueDate);
    return differenceInDays(targetDate, new Date()) < 0;
  } catch {
    return false;
  }
};

/**
 * Get current date in 'yyyy-MM-dd' format.
 */
export const getCurrentDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};
export { toDateObject };
/**
 * Get current time in 'HH:mm' format.
 */
export const getCurrentTime = (): string => {
  return format(new Date(), 'HH:mm');
};
