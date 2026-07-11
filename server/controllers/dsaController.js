const mongoose = require('mongoose');
const DsaProblem = require('../models/DsaProblem');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Helper to parse local date string to local midnight Date object
const parseLocalDateStr = (str) => {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Helper to format Date object into YYYY-MM-DD
const formatLocalDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calculate streak based on solvedDate
const calculateStreak = (problems) => {
  const solvedProblems = problems.filter((p) => p.status === 'Solved' && p.solvedDate);
  if (solvedProblems.length === 0) return 0;

  // Map to local date string YYYY-MM-DD
  const dateStrings = solvedProblems.map((p) => formatLocalDate(new Date(p.solvedDate)));

  // Deduplicate
  const uniqueDates = [...new Set(dateStrings)];

  // Sort descending (newest first)
  uniqueDates.sort((a, b) => new Date(b) - new Date(a));

  const today = new Date();
  const todayStr = formatLocalDate(today);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  const newestDateStr = uniqueDates[0];
  // Streak is broken if the last solved date is not today and not yesterday
  if (newestDateStr !== todayStr && newestDateStr !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let currentTrackerDate = parseLocalDateStr(newestDateStr);

  for (let i = 0; i < uniqueDates.length; i++) {
    const dateStr = uniqueDates[i];
    const itemDate = parseLocalDateStr(dateStr);
    const diffTime = currentTrackerDate - itemDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (i === 0) {
      streak = 1;
      currentTrackerDate = itemDate;
    } else if (diffDays === 1) {
      streak += 1;
      currentTrackerDate = itemDate;
    } else if (diffDays > 1) {
      break;
    }
  }

  return streak;
};

// Helper: load and check ownership
const findOwnedProblemOrFail = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid problem id');
  }

  const problem = await DsaProblem.findById(id);

  if (!problem) {
    throw new ApiError(404, 'Problem not found');
  }

  if (problem.user.toString() !== userId.toString()) {
    throw new ApiError(403, 'You do not have access to this problem');
  }

  return problem;
};

// @desc    Create a new DSA problem
// @route   POST /api/dsa
// @access  Private
const createProblem = asyncHandler(async (req, res) => {
  const { title, platform, problemUrl, difficulty, topic, status, revisionCount, solvedDate, notes } = req.body;

  if (!title || !platform || !difficulty || !topic) {
    throw new ApiError(400, 'Title, platform, difficulty, and topic are required');
  }

  // Set solvedDate if status is Solved and solvedDate is not provided
  let finalSolvedDate = solvedDate || null;
  if (status === 'Solved' && !finalSolvedDate) {
    finalSolvedDate = new Date();
  }

  const problem = await DsaProblem.create({
    user: req.user._id,
    title,
    platform,
    problemUrl: problemUrl || '',
    difficulty,
    topic,
    status: status || 'Todo',
    revisionCount: revisionCount || 0,
    solvedDate: finalSolvedDate,
    notes: notes || '',
  });

  res.status(201).json({ success: true, data: problem });
});

// @desc    Get all DSA problems with filters & dashboard stats
// @route   GET /api/dsa
// @access  Private
const getProblems = asyncHandler(async (req, res) => {
  const { search, status, difficulty, platform, topic } = req.query;

  const query = { user: req.user._id };

  if (status) query.status = status;
  if (difficulty) query.difficulty = difficulty;
  if (platform) query.platform = platform;
  if (topic) query.topic = topic;

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    query.$or = [{ title: regex }, { topic: regex }];
  }

  // We fetch all of the user's problems first to calculate aggregated statistics
  const allProblems = await DsaProblem.find({ user: req.user._id });

  // Calculate statistics
  const stats = {
    totalProblems: allProblems.length,
    totalSolved: allProblems.filter((p) => p.status === 'Solved').length,
    easy: allProblems.filter((p) => p.status === 'Solved' && p.difficulty === 'Easy').length,
    medium: allProblems.filter((p) => p.status === 'Solved' && p.difficulty === 'Medium').length,
    hard: allProblems.filter((p) => p.status === 'Solved' && p.difficulty === 'Hard').length,
    streak: calculateStreak(allProblems),
  };

  // Get the filtered list for the current request
  const filteredProblems = await DsaProblem.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    stats,
    count: filteredProblems.length,
    data: filteredProblems,
  });
});

// @desc    Get a single DSA problem by id
// @route   GET /api/dsa/:id
// @access  Private
const getProblemById = asyncHandler(async (req, res) => {
  const problem = await findOwnedProblemOrFail(req.params.id, req.user._id);
  res.json({ success: true, data: problem });
});

// @desc    Update a DSA problem log
// @route   PUT /api/dsa/:id
// @access  Private
const updateProblem = asyncHandler(async (req, res) => {
  const problem = await findOwnedProblemOrFail(req.params.id, req.user._id);

  const updatableFields = [
    'title',
    'platform',
    'problemUrl',
    'difficulty',
    'topic',
    'status',
    'revisionCount',
    'solvedDate',
    'notes',
  ];

  const prevStatus = problem.status;
  const nextStatus = req.body.status;

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      problem[field] = req.body[field];
    }
  });

  // If status is updated to Solved, and it doesn't have a solvedDate yet, set it to now
  if (nextStatus === 'Solved' && prevStatus !== 'Solved' && !problem.solvedDate) {
    problem.solvedDate = new Date();
  }

  // NOTE: According to instructions, we do NOT clear solvedDate when status changes away from Solved.

  const updated = await problem.save();
  res.json({ success: true, data: updated });
});

// @desc    Delete a DSA problem
// @route   DELETE /api/dsa/:id
// @access  Private
const deleteProblem = asyncHandler(async (req, res) => {
  const problem = await findOwnedProblemOrFail(req.params.id, req.user._id);
  await problem.deleteOne();
  res.json({ success: true, data: { _id: req.params.id } });
});

module.exports = {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
};
