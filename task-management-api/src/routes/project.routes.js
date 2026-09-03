const express = require('express');

const projectController = require('../controllers/project.controller');

const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize('admin'),
  projectController.createProject
);

router.get(
  '/',
  authenticate,
  authorize('admin', 'user'),
  projectController.getProjects
);

router.get(
  '/:id',
  authenticate,
  authorize('admin', 'user'),
  projectController.getProjectById
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  projectController.updateProject
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  projectController.deleteProject
);

module.exports = router;