'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('admin', {
      admin_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUID // untuk MySQL / MariaDB
      },
      nama: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('admin');
  }
};
