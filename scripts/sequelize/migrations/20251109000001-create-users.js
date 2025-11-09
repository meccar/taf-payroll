'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.STRING(26),
        primaryKey: true,
        allowNull: false,
      },
      user_name: {
        type: Sequelize.STRING(256),
        allowNull: true,
      },
      normalized_user_name: {
        type: Sequelize.STRING(256),
        allowNull: true,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(256),
        allowNull: true,
      },
      normalized_email: {
        type: Sequelize.STRING(256),
        allowNull: true,
        unique: true,
      },
      email_confirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      security_stamp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      concurrency_stamp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone_number: {
        type: Sequelize.STRING(32),
        allowNull: true,
      },
      phone_number_confirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      two_factor_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      lockout_end: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lockout_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      access_failed_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_by: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      updated_by: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('users', ['user_name'], {
      name: 'idx_users_user_name',
      unique: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};
