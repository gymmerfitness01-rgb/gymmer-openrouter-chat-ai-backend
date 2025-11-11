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
        model: "deepseek/deepseek-chat-v3.1:free", // use any available model on OpenRouter
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    // xtract response safely (works across multiple model formats)
    let content =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      data?.message?.content ||
      data?.content ||
      "";

    // Clean up any model artifacts or control tokens
    content = content
      .replace(/<\｜.*?\｜>/g, "") // handles <｜begin▁of▁sentence｜>
      .replace(/<\|.*?\|>/g, "")   // handles <|im_start|>, <|im_end|>
      .trim();

    // Return plain text to Flutter
    res.setHeader("Content-Type", "text/plain");
    res.send(content || "No response from model.");

    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));