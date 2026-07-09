const mongoose = require('mongoose');

const APPLICATION_TYPES = ['Internship', 'Full-time', 'Part-time', 'Freelance'];
const APPLICATION_STATUSES = [
  'Wishlist',
  'Applied',
  'Assessment',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
];
const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
const APPLICATION_SOURCES = [
  'LinkedIn',
  'Company Website',
  'Referral',
  'College',
  'Job Portal',
  'Other',
];

// A single entry in an application's status history timeline.
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [120, 'Company name cannot exceed 120 characters'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
      maxlength: [120, 'Role cannot exceed 120 characters'],
    },
    type: {
      type: String,
      enum: APPLICATION_TYPES,
      required: [true, 'Application type is required'],
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'Wishlist',
    },
    workMode: {
      type: String,
      enum: WORK_MODES,
      required: [true, 'Work mode is required'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [120, 'Location cannot exceed 120 characters'],
      default: '',
    },
    source: {
      type: String,
      enum: APPLICATION_SOURCES,
      required: [true, 'Source is required'],
    },
    applicationUrl: {
      type: String,
      trim: true,
      default: '',
    },
    appliedDate: {
      type: Date,
      default: null,
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: '',
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Useful compound index for the common "my applications, most recent first" query.
applicationSchema.index({ user: 1, createdAt: -1 });

// Text index to support company/role search via $text if ever needed;
// the controller currently uses a case-insensitive regex for simpler, predictable matching.
applicationSchema.index({ company: 'text', role: 'text' });

module.exports = mongoose.model('Application', applicationSchema);
module.exports.APPLICATION_TYPES = APPLICATION_TYPES;
module.exports.APPLICATION_STATUSES = APPLICATION_STATUSES;
module.exports.WORK_MODES = WORK_MODES;
module.exports.APPLICATION_SOURCES = APPLICATION_SOURCES;
