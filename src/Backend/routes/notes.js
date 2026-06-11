const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Note = require("../models/Note");

// Get all notes
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { user_id: req.userId },
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create note
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.create({
      user_id: req.userId,
      title,
      content,
    });
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update note
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id, user_id: req.userId },
    });
    if (!note) return res.status(404).json({ error: "Note not found" });
    await note.update(req.body);
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete note
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Note.destroy({ where: { id: req.params.id, user_id: req.userId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
