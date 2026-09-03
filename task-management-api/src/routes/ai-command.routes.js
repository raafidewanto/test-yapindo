const express = require('express');

const aiCommandController = require('../controllers/ai-command.controller');

const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();

router.post(
  '/ai/command',
  authenticate,
  authorize('admin', 'user'),
  aiCommandController.executeCommand
);

module.exports = router;