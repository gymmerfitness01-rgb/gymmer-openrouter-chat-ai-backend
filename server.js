import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors()); // Handles CORS
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Test route
app.get("/", (req, res) => {
  res.send("Render OpenRouter backend is running!");
});

// Main AI endpoint
app.post("/api/ask", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://gymmer-openrouter-chat-ai-backend.onrender.com/", // optional
        "X-Title": "Gymmer AI Assistant",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // use any available model on OpenRouter
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));