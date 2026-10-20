
const express = require("express");

const router = express.Router();

router.post("/generate-description", async (req, res) => {
  try {
    const title =
      typeof req.body.title === "string"
        ? req.body.title.trim()
        : "";

    if (!title) {
      return res.status(400).json({
        description: "",
        message: "Please enter a task title first.",
      });
    }

    if (title.length > 200) {
      return res.status(400).json({
        description: "",
        message: "Task title must be 200 characters or fewer.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        description: "",
        fallback: true,
        message:
          "Gemini is unavailable. Please enter the description manually.",
      });
    }

    // Dynamic import works with this CommonJS Express route.
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        "Write a clear, practical task description in 2-3 sentences. " +
        "Describe the objective and expected outcome. " +
        "Do not invent deadlines or personal information.\n\n" +
        "Task title: " + title,
      ],
    });

    const description = response.text?.trim() || "";

    if (!description) {
      return res.status(200).json({
        description: "",
        fallback: true,
        message:
          "No AI suggestion was returned. Please enter the description manually.",
      });
    }

    return res.status(200).json({
      description,
      fallback: false,
      message: "AI suggestion generated. Please review it.",
    });
  } catch (error) {
    console.error(
      "Gemini description generation failed:",
      error.message
    );

    return res.status(200).json({
      description: "",
      fallback: true,
      message:
        "AI is temporarily unavailable. Please enter the description manually.",
    });
  }
});

module.exports = router;
