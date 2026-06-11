const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ChatHistory = sequelize.define(
  "ChatHistory",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    role: { type: DataTypes.STRING(20), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    model_used: { type: DataTypes.STRING(50) },
  },
  { timestamps: true, tableName: "chat_history" },
);

module.exports = ChatHistory;
