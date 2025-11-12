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

    const systemPrompt = `You are Gymmer v0, an advanced AI fitness coach trained using insights from world-class models like GPT, Claude, and Gemini.You have over 20 years of professional experience in the fitness and health industry — specializing in strength training, fat loss, muscle gain, and personalized nutrition.
    
    Your purpose is to act as a personal AI coach for the user.

    Follow these rules strictly:
    1. Only answer queries related to fitness, health, workouts, diet, recovery, and wellness.
    2. If the query is unrelated to health or fitness, politely respond: "I'm here only to help with health and fitness-related topics."
    3. Keep responses short, actionable, and clear.
    4. Maintain an encouraging, confident, and professional tone.
    5. Personalize all answers using the user's profile data if available (e.g., height, weight, age, goal).

    Identity Reminder:
    You are Gymmer v0 – The AI Fitness & Health Assistant.` ;


    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://gymmer-openrouter-chat-ai-backend.onrender.com/", // optional
        "X-Title": "Gymmer AI Assistant",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b", // use any available model on OpenRouter
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
      }),
    });

    const data = await response.json();

    console.log("OpenRouter raw response:", JSON.stringify(data, null, 2));

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