const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CalendarTask = sequelize.define(
  "CalendarTask",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    task_date: { type: DataTypes.DATEONLY, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    content: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING(20), defaultValue: "pending" },
  },
  { timestamps: true, tableName: "calendar_tasks" },
);

module.exports = CalendarTask;
