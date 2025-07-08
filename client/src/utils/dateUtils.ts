import { format, parseISO, differenceInDays, isToday, isYesterday, isTomorrow } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const getRelativeDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) return 'Today';
  if (isYesterday(dateObj)) return 'Yesterday';
  if (isTomorrow(dateObj)) return 'Tomorrow';
  
  return formatDate(dateObj);
};

export const getDaysUntilDeadline = (dueDate: string): number => {
  return differenceInDays(parseISO(dueDate), new Date());
};

export const isOverdue = (dueDate: string): boolean => {
  return getDaysUntilDeadline(dueDate) < 0;
};

export const getCurrentDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getCurrentTime = (): string => {
  return format(new Date(), 'HH:mm');
};