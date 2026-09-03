const User = require('./user.model');
const Project = require('./project.model');
const Task = require('./task.model');
const AuditLog = require('./audit-log.model');

// User -> Project
User.hasMany(Project, {
  foreignKey: 'createdBy',
  as: 'projects',
});

Project.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

// Project -> Task
Project.hasMany(Task, {
  foreignKey: 'projectId',
  as: 'tasks',
  onDelete: 'CASCADE',
});

Task.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project',
});

// User -> Task
User.hasMany(Task, {
  foreignKey: 'assigneeId',
  as: 'assignedTasks',
});

Task.belongsTo(User, {
  foreignKey: 'assigneeId',
  as: 'assignee',
});

// User -> Audit Log
User.hasMany(AuditLog, {
  foreignKey: 'userId',
  as: 'auditLogs',
});

AuditLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

module.exports = {
  User,
  Project,
  Task,
  AuditLog,
};