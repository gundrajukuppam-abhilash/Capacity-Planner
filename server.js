import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.warn("Warning: API_KEY is not set in the server environment variables.");
}

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

app.post('/api/analyze', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({ 
        error: "Configuration Error", 
        details: "Server API Key not configured. Please set API_KEY in .env file." 
      });
    }

    const { context } = req.body;

    if (!context) {
        return res.status(400).json({ error: "Missing context data" });
    }

    const prompt = `
      Analyze the following capacity plan and provide a JSON response.
      
      Context:
      ${JSON.stringify(context, null, 2)}

      Please identify potential risks (e.g., key roles missing, low capacity for specific roles) 
      and provide actionable suggestions. Also write a professional summary suitable for a planning meeting.

      Return JSON format ONLY:
      {
        "risks": ["string", "string"],
        "suggestions": ["string", "string"],
        "summary": "string"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    // Extract text directly from the response object
    const jsonString = response.text;
    const json = JSON.parse(jsonString || "{}");
    
    res.json(json);

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    res.status(500).json({ 
        error: "Failed to process analysis", 
        details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

app.listen(port, () => {
  console.log(`Capacity Planner Backend running at http://localhost:${port}`);
});