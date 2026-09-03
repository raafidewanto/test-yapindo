const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define(
  'AuditLog',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },

    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    requestPayload: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'request_payload',
    },

    responsePayload: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'response_payload',
    },

    status: {
      type: DataTypes.ENUM('success', 'failed'),
      allowNull: false,
    },

    failedReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'failed_reason',
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    tableName: 'audit_logs',
    timestamps: false,
  }
);

module.exports = AuditLog;