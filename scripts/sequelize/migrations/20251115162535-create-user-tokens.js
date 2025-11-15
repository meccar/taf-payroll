'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_tokens', {
      id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.STRING(26),
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      login_provider: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },
      value: {
        type: Sequelize.STRING,
        allowNull: true,
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

    // Add unique constraint on user_id, login_provider, and name combination
    await queryInterface.addIndex(
      'user_tokens',
      ['user_id', 'login_provider', 'name'],
      {
        unique: true,
        name: 'user_tokens_user_provider_name_unique',
      },
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user_tokens');
  },
};
