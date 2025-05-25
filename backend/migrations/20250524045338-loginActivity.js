"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("login_activity", {
      login_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      nasabah_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "nasabah",
          key: "nasabah_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      waktu_login: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING,
      },
      device_info: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM("SUCCESS", "FAILED"),
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("login_activity");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_login_activity_status";');
  },
};
