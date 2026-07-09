const express = require('express');
const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Every application route requires a logged-in user.
router.use(protect);

router.route('/').post(createApplication).get(getApplications);

router
  .route('/:id')
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

module.exports = router;
