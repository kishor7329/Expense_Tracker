const { Sequelize } = require("sequelize");

// Use the DATABASE_URL from .env
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // Set to true to see SQL queries
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // For Neon DB
    },
  },
});

module.exports = sequelize;
