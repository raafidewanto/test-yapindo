const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define(
    'Task',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        projectId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'project_id',
            references: {
                model: 'projects',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },

        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        status: {
            type: DataTypes.ENUM('todo', 'in_progress', 'done'),
            allowNull: false,
            defaultValue: 'todo',
        },

        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high'),
            allowNull: false,
            defaultValue: 'medium',
        },

        assigneeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'assignee_id',
            references: {
                model: 'users',
                key: 'id',
            },
        },
    },
    {
        tableName: 'tasks',
        timestamps: true,

        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

module.exports = Task;