const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define(
    'Project',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'created_by',
            references: {
                model: 'users',
                key: 'id',
            },
        },
    },
    {
        tableName: 'projects',
        timestamps: true,

        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

module.exports = Project;