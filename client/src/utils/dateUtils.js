// Simple, transparent date logic — no external date library needed.
// All comparisons are done at the day level (time-of-day is ignored)
// so "Due Today" behaves the way a person would expect.

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Strips the time portion so day-level diffs are exact regardless of time-of-day.
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Number of whole days between two dates (positive if `date` is after `from`).
export const diffInDays = (date, from = new Date()) => {
  const a = startOfDay(date);
  const b = startOfDay(from);
  return Math.round((a - b) / MS_PER_DAY);
};

// Formats a date as "12 Jun 2026". Returns a placeholder for missing dates.
export const formatDate = (date) => {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Formats a date as "12 Jun" (no year) — used in compact timelines.
export const formatDateShort = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

// Formats a date + time, used for "Recent Status Activity" entries.
export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Turns a follow-up date into a { group, label } describing urgency.
// group is one of 'overdue' | 'today' | 'upcoming'.
export const getFollowUpStatus = (nextFollowUpDate) => {
  if (!nextFollowUpDate) return null;

  const days = diffInDays(nextFollowUpDate);

  if (days < 0) {
    const overdueBy = Math.abs(days);
    return {
      group: 'overdue',
      label: overdueBy === 1 ? '1 day overdue' : `${overdueBy} days overdue`,
    };
  }

  if (days === 0) {
    return { group: 'today', label: 'Due today' };
  }

  return {
    group: 'upcoming',
    label: days === 1 ? 'Due tomorrow' : `Due in ${days} days`,
  };
};

// Returns true if an application has sat in a given status for at least
// `thresholdDays` without any newer status change (i.e. current status
// is still the most recent history entry).
export const isStaleInStatus = (application, status, thresholdDays) => {
  if (application.status !== status || !application.statusHistory?.length) return false;

  const lastEntry = application.statusHistory[application.statusHistory.length - 1];
  if (lastEntry.status !== status) return false;

  const daysSinceChange = Math.abs(diffInDays(lastEntry.changedAt));
  return daysSinceChange >= thresholdDays;
};

export const daysSince = (date) => Math.abs(diffInDays(date));
