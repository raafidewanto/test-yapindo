'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      action: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      request_payload: {
        type: Sequelize.JSONB,
        allowNull: false,
      },

      response_payload: {
        type: Sequelize.JSONB,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM('success', 'failed'),
        allowNull: false,
      },

      failed_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_audit_logs_status";'
    );
  },
};