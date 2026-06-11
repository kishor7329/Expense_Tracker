require("dotenv").config({ path: "../../.env" });
const sequelize = require("./config/database");
const Note = require("./models/Note");

async function test() {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
    const notes = await Note.findAll({
      where: { user_id: 1 },
      order: [["createdAt", "DESC"]]
    });
    console.log("Notes found:", notes.length);
  } catch (err) {
    console.error("Query error:", err);
  } finally {
    process.exit();
  }
}
test();
