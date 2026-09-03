const { Task, User, Project } = require('../models');

const getTasksByProject = async (projectId) => {
  const project = await Project.findByPk(projectId);

  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }

  const tasks = await Task.findAll({
    where: {
      projectId,
    },
    include: [
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email'],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  return {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
    },
    tasks,
  };
};

const createTask = async (data, transaction) => {
  const project = await Project.findByPk(data.projectId, {
    transaction,
  });

  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }

  const assignee = await User.findByPk(data.assigneeId, {
    transaction,
  });

  if (!assignee) {
    const error = new Error('Assignee not found');
    error.status = 404;
    throw error;
  }

  const task = await Task.create(data, {
    transaction,
  });

  return task;
};

const updateTask = async (taskId, data, transaction) => {
  const task = await Task.findByPk(taskId, {
    transaction,
  });

  if (!task) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }

  if (data.assigneeId) {
    const assignee = await User.findByPk(data.assigneeId, {
      transaction,
    });

    if (!assignee) {
      const error = new Error('Assignee not found');
      error.status = 404;
      throw error;
    }
  }

  await task.update(data, {
    transaction,
  });

  return task;
};

const deleteTask = async (taskId, transaction) => {
  const task = await Task.findByPk(taskId, {
    transaction,
  });

  if (!task) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }

  await task.destroy({
    transaction,
  });

  return task;
};

module.exports = {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
};