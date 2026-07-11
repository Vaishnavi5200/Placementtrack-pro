const express = require('express');
const {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} = require('../controllers/dsaController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Every DSA tracker route requires authentication
router.use(protect);

router.route('/').post(createProblem).get(getProblems);

router
  .route('/:id')
  .get(getProblemById)
  .put(updateProblem)
  .delete(deleteProblem);

module.exports = router;
