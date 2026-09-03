const taskService = require('../services/task.service');

const getTasksByProject = async (req, res, next) => {
  try {
    const result = await taskService.getTasksByProject(
      req.params.id
    );

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasksByProject,
};