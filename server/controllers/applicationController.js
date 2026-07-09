const mongoose = require('mongoose');
const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Loads an application by id and verifies it belongs to the requesting user.
// Shared by getOne/update/delete so ownership is checked in exactly one place.
const findOwnedApplicationOrFail = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid application id');
  }

  const application = await Application.findById(id);

  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  if (application.user.toString() !== userId.toString()) {
    throw new ApiError(403, 'You do not have access to this application');
  }

  return application;
};

// @desc    Create a new application
// @route   POST /api/applications
// @access  Private
const createApplication = asyncHandler(async (req, res) => {
  const { company, role, type, status, workMode, location, source, applicationUrl, appliedDate, nextFollowUpDate, notes } = req.body;

  if (!company || !role || !type || !workMode || !source) {
    throw new ApiError(400, 'Company, role, type, work mode, and source are required');
  }

  const initialStatus = status || 'Wishlist';

  const application = await Application.create({
    user: req.user._id,
    company,
    role,
    type,
    status: initialStatus,
    workMode,
    location,
    source,
    applicationUrl,
    appliedDate: appliedDate || null,
    nextFollowUpDate: nextFollowUpDate || null,
    notes,
    // Every application starts with one history entry marking its initial status.
    statusHistory: [{ status: initialStatus, changedAt: new Date() }],
  });

  res.status(201).json({ success: true, data: application });
});

// @desc    Get all applications for the logged-in user (with search/filter)
// @route   GET /api/applications
// @access  Private
const getApplications = asyncHandler(async (req, res) => {
  const { search, status, type, workMode, source } = req.query;

  const query = { user: req.user._id };

  if (status) query.status = status;
  if (type) query.type = type;
  if (workMode) query.workMode = workMode;
  if (source) query.source = source;

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    query.$or = [{ company: regex }, { role: regex }];
  }

  const applications = await Application.find(query).sort({ createdAt: -1 });

  res.json({ success: true, count: applications.length, data: applications });
});

// @desc    Get a single application by id
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = asyncHandler(async (req, res) => {
  const application = await findOwnedApplicationOrFail(req.params.id, req.user._id);
  res.json({ success: true, data: application });
});

// @desc    Update an application
// @route   PUT /api/applications/:id
// @access  Private
const updateApplication = asyncHandler(async (req, res) => {
  const application = await findOwnedApplicationOrFail(req.params.id, req.user._id);

  const updatableFields = [
    'company',
    'role',
    'type',
    'status',
    'workMode',
    'location',
    'source',
    'applicationUrl',
    'appliedDate',
    'nextFollowUpDate',
    'notes',
  ];

  const nextStatus = req.body.status;
  const statusIsChanging = nextStatus && nextStatus !== application.status;

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      application[field] = req.body[field];
    }
  });

  // Only append to the timeline when the status actually changed, per spec.
  if (statusIsChanging) {
    application.statusHistory.push({ status: nextStatus, changedAt: new Date() });
  }

  const updated = await application.save();

  res.json({ success: true, data: updated });
});

// @desc    Delete an application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = asyncHandler(async (req, res) => {
  const application = await findOwnedApplicationOrFail(req.params.id, req.user._id);
  await application.deleteOne();
  res.json({ success: true, data: { _id: req.params.id } });
});

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
};
