require("dotenv").config({ path: "../../.env" });
const sequelize = require("./config/database");
const CalendarTask = require("./models/CalendarTask");

async function test() {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    // Sync just to be sure
    await CalendarTask.sync({ alter: true });

    const task = await CalendarTask.create({
      user_id: 1, // Assume user 1 exists
      task_date: "2026-06-11",
      title: "Test Task",
      content: "This is a test task",
      status: "pending",
    });
    console.log("Task created successfully:", task.toJSON());
  } catch (err) {
    console.error("Error creating task:", err.message);
    if (err.errors) {
      err.errors.forEach(e => console.error(e.message));
    }
  } finally {
    process.exit();
  }
}
test();
