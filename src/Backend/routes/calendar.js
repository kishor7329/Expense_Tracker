const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const CalendarTask = require("../models/CalendarTask");

// Get all tasks
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await CalendarTask.findAll({
      where: { user_id: req.userId },
      order: [["task_date", "ASC"]],
    });
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create task
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { task_date, title, content, status } = req.body;
    const task = await CalendarTask.create({
      user_id: req.userId,
      task_date,
      title,
      content,
      status: status || "pending",
    });
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await CalendarTask.findOne({
      where: { id: req.params.id, user_id: req.userId },
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    await task.update(req.body);
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await CalendarTask.destroy({
      where: { id: req.params.id, user_id: req.userId },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
