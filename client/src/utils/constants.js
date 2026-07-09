export const APPLICATION_TYPES = ['Internship', 'Full-time', 'Part-time', 'Freelance'];

export const APPLICATION_STATUSES = [
  'Wishlist',
  'Applied',
  'Assessment',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
];

export const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];

export const APPLICATION_SOURCES = [
  'LinkedIn',
  'Company Website',
  'Referral',
  'College',
  'Job Portal',
  'Other',
];

// Statuses that still count as an "active" pipeline application on the dashboard.
export const ACTIVE_STATUSES = ['Wishlist', 'Applied', 'Assessment', 'Interview'];

// Maps a status string to the CSS variable pair used by the status badge.
export const STATUS_COLOR_MAP = {
  Wishlist: 'wishlist',
  Applied: 'applied',
  Assessment: 'assessment',
  Interview: 'interview',
  Offer: 'offer',
  Rejected: 'rejected',
  Withdrawn: 'withdrawn',
};

// A meaningful number of days an application can sit in "Applied" before
// it's flagged as needing attention on the dashboard.
export const STALE_APPLIED_THRESHOLD_DAYS = 10;
