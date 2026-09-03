const express = require('express');

const taskController = require('../controllers/task.controller');

const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();

router.get(
  '/projects/:id/tasks',
  authenticate,
  authorize('admin', 'user'),
  taskController.getTasksByProject
);

module.exports = router;