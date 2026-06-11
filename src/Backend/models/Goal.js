const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Goal = sequelize.define(
  "Goal",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    target_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    saved_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    deadline: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.STRING(20), defaultValue: "active" },
  },
  { timestamps: true, tableName: "goals" },
);

module.exports = Goal;
