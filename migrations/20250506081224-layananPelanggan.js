export default {
  up: async (queryInterface, sequelize) => {
    await queryInterface.createTable('cs', {
      cs_id: {
        type: sequelize.UUID,
        defaultValue: sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      nama: {
        type: sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: sequelize.STRING,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, sequelize) => {
    await queryInterface.dropTable('cs');
  },
};
