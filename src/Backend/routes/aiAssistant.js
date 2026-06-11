const express = require("express");
const { Mistral } = require("@mistralai/mistralai");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Goal = require("../models/Goal");
const Note = require("../models/Note");
const CalendarTask = require("../models/CalendarTask");
const ChatHistory = require("../models/ChatHistory");

// Initialize Mistral client
const apiKey = process.env.MISTRAL_API_KEY;
let mistralClient = null;

if (apiKey) {
  mistralClient = new Mistral({ apiKey: apiKey });
  console.log("✅ Mistral AI client initialized");
} else {
  console.error("❌ MISTRAL_API_KEY not found in .env");
}

const MODELS = [
  {
    id: "mistral-tiny",
    name: "⚡ Mistral Tiny",
    description: "Fastest, lightweight responses",
  },
  {
    id: "mistral-small",
    name: "📘 Mistral Small",
    description: "Balanced speed & quality",
  },
  {
    id: "mistral-medium",
    name: "🧠 Mistral Medium",
    description: "Stronger reasoning, best quality",
  },
];

// POST /api/ai/chat - with RAG (Retrieval Augmented Generation)
router.post("/chat", authMiddleware, async (req, res) => {
  console.log("📨 Received chat request from user:", req.userId);

  const { message, model } = req.body;
  const chosenModel = model || "mistral-tiny";

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!mistralClient) {
    return res.status(500).json({
      success: false,
      error:
        "Mistral API not configured. Please add MISTRAL_API_KEY to .env file.",
    });
  }

  try {
    // ========== STEP 1: SAVE USER MESSAGE TO DATABASE ==========
    await ChatHistory.create({
      user_id: req.userId,
      role: "user",
      content: message,
      model_used: chosenModel,
    });

    // ========== STEP 2: FETCH USER DATA FROM DATABASE ==========
    console.log("🔍 Fetching user data from database...");

    // Fetch active goals
    const goals = await Goal.findAll({
      where: { user_id: req.userId, status: "active" },
      order: [["deadline", "ASC"]],
    });

    // Fetch recent notes (last 5)
  const notes = await Note.findAll({
    where: { user_id: req.userId },
    order: [["createdAt", "DESC"]],
    limit: 5,
  });

    // Fetch pending calendar tasks (upcoming 5)
    const tasks = await CalendarTask.findAll({
      where: { user_id: req.userId, status: "pending" },
      order: [["task_date", "ASC"]],
      limit: 5,
    });

    // Fetch recent chat history (last 10 messages for context)
    const recentChats = await ChatHistory.findAll({
      where: { user_id: req.userId },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    console.log(
      `📊 Found: ${goals.length} goals, ${notes.length} notes, ${tasks.length} tasks`,
    );

    // ========== STEP 3: BUILD CONTEXT FROM USER DATA ==========
    let context = "";

    if (goals.length > 0) {
      context += "\n## YOUR FINANCIAL GOALS:\n";
      goals.forEach((g) => {
        const saved = parseFloat(g.saved_amount) || 0;
        const target = parseFloat(g.target_amount);
        const progress = ((saved / target) * 100).toFixed(1);
        context += `- ${g.name}: ₹${target.toLocaleString()} target, ₹${saved.toLocaleString()} saved (${progress}% complete), due ${g.deadline}\n`;
      });
    } else {
      context +=
        "\n## YOUR FINANCIAL GOALS:\nNo active goals yet. Create one to get personalized advice!\n";
    }

    if (notes.length > 0) {
      context += "\n## YOUR RECENT NOTES:\n";
      notes.forEach((n) => {
        const preview = n.content?.substring(0, 100) || "";
        context += `- ${n.title}: ${preview}${preview.length === 100 ? "..." : ""}\n`;
      });
    }

    if (tasks.length > 0) {
      context += "\n## YOUR UPCOMING TASKS:\n";
      tasks.forEach((t) => {
        context += `- ${t.task_date}: ${t.title}\n`;
      });
    }

    // ========== STEP 4: BUILD CONVERSATION HISTORY ==========
    let conversationHistory = [];
    if (recentChats.length > 0) {
      // Reverse to get chronological order (oldest first)
      const orderedChats = [...recentChats].reverse();
      conversationHistory = orderedChats.map((chat) => ({
        role: chat.role,
        content: chat.content,
      }));
    }

    // ========== STEP 5: BUILD AUGMENTED PROMPT ==========
    const systemPrompt = `You are SynTropy AI Assistant, a helpful financial advisor and productivity coach.

USER DATA (from their database):
${context}

INSTRUCTIONS:
1. Use the user's ACTUAL data to answer - be specific with their numbers
2. If multiple goals relate to the question, mention them all
3. If no relevant data exists, give general financial advice
4. Be concise (2-3 paragraphs max), friendly, and practical
5. Use bullet points when helpful
6. Never make up data that isn't in the user's context above`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    // ========== STEP 6: CALL MISTRAL API ==========
    console.log("🚀 Calling Mistral API with RAG context...");

    const response = await mistralClient.chat.complete({
      model: chosenModel,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = response.choices[0].message.content;
    console.log("✅ Mistral API responded successfully");

    // ========== STEP 7: SAVE AI RESPONSE TO DATABASE ==========
    await ChatHistory.create({
      user_id: req.userId,
      role: "assistant",
      content: aiResponse,
      model_used: chosenModel,
    });

    // ========== STEP 8: RETURN RESPONSE ==========
    res.json({
      success: true,
      response: aiResponse,
      model: chosenModel,
    });
  } catch (error) {
    console.error("❌ Error in /chat:", error.message);

    if (error.message?.includes("401") || error.status === 401) {
      return res.status(401).json({
        success: false,
        error:
          "Invalid API key. Please check your MISTRAL_API_KEY in .env file.",
      });
    }

    if (error.message?.includes("429") || error.status === 429) {
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded. Please try again in a moment.",
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "Failed to get response from AI",
    });
  }
});

// GET /api/ai/models - Get available models
router.get("/models", (req, res) => {
  res.json({ models: MODELS });
});

// GET /api/ai/history - Get user's chat history
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const history = await ChatHistory.findAll({
      where: { user_id: req.userId },
      order: [["createdAt", "ASC"]],
      limit: 50,
    });
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/ai/history - Clear user's chat history
router.delete("/history", authMiddleware, async (req, res) => {
  try {
    await ChatHistory.destroy({ where: { user_id: req.userId } });
    res.json({ success: true, message: "Chat history cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
