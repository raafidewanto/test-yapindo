const projectService = require('../services/project.service');

const {
  createProjectSchema,
  updateProjectSchema,
} = require('../validators/project.validator');

const createProject = async (req, res, next) => {
  try {
    const data = createProjectSchema.parse(req.body);

    const project = await projectService.createProject(
      data,
      req.user.id
    );

    res.status(201).json({
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getProjects();

    res.status(200).json({
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(
      req.params.id
    );

    res.status(200).json({
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const data = updateProjectSchema.parse(req.body);

    const project = await projectService.updateProject(
      req.params.id,
      data
    );

    res.status(200).json({
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id);

    res.status(200).json({
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};