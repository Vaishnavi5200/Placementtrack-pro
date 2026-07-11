const mongoose = require('mongoose');

const DSA_PLATFORMS = ['LeetCode', 'HackerRank', 'GeeksforGeeks', 'Codeforces', 'InterviewBit', 'Other'];
const DSA_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DSA_STATUSES = ['Todo', 'Attempted', 'Solved', 'Needs Review'];

const dsaProblemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
      maxlength: [150, 'Problem title cannot exceed 150 characters'],
    },
    platform: {
      type: String,
      enum: {
        values: DSA_PLATFORMS,
        message: 'Platform must be one of: LeetCode, HackerRank, GeeksforGeeks, Codeforces, InterviewBit, Other',
      },
      required: [true, 'Platform is required'],
    },
    problemUrl: {
      type: String,
      trim: true,
      default: '',
    },
    difficulty: {
      type: String,
      enum: {
        values: DSA_DIFFICULTIES,
        message: 'Difficulty must be Easy, Medium, or Hard',
      },
      required: [true, 'Difficulty level is required'],
    },
    topic: {
      type: String,
      required: [true, 'Topic (e.g. Arrays, DP) is required'],
      trim: true,
      maxlength: [50, 'Topic cannot exceed 50 characters'],
    },
    status: {
      type: String,
      enum: {
        values: DSA_STATUSES,
        message: 'Status must be Todo, Attempted, Solved, or Needs Review',
      },
      default: 'Todo',
    },
    revisionCount: {
      type: Number,
      default: 0,
      min: [0, 'Revision count cannot be negative'],
    },
    solvedDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index for listing problems by user, sorted by most recent
dsaProblemSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('DsaProblem', dsaProblemSchema);
module.exports.DSA_PLATFORMS = DSA_PLATFORMS;
module.exports.DSA_DIFFICULTIES = DSA_DIFFICULTIES;
module.exports.DSA_STATUSES = DSA_STATUSES;
