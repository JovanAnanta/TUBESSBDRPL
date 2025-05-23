"use strict";

/** @type {import('sequelize-cli').Migration} */
export default{
  up: async (queryInterface, Sequelize) => {
      queryInterface.createTable("session", {
      token: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      exp_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable("sessions");
  },
};
