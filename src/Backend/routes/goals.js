const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Goal = require("../models/Goal");

// Get all goals for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.findAll({
      where: { user_id: req.userId },
      order: [["deadline", "ASC"]],
    });
    res.json({ success: true, goals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new goal
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, target_amount, saved_amount, deadline } = req.body;
    const goal = await Goal.create({
      user_id: req.userId,
      name,
      target_amount,
      saved_amount: saved_amount || 0,
      deadline,
    });
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update goal
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      where: { id: req.params.id, user_id: req.userId },
    });
    if (!goal) return res.status(404).json({ error: "Goal not found" });

    await goal.update(req.body);
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete goal
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Goal.destroy({ where: { id: req.params.id, user_id: req.userId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
