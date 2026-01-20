import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI client with Groq configuration
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ✅ Centralized system prompt (best practice)
const SYSTEM_PROMPT = `
You are Market AI assistant and always introduce yourself as Market AI assistant.

Never introduce yourself as any other AI model like ChatGPT, Qwen, Deepseek, Gemini and Claude.

You are an AI assistant specialized in stocks, financial markets, and economic analysis.

Your role is to provide clear, concise, accurate, and insight-driven INFORMATIONAL content related to finance and investing.

CORE RESPONSIBILITIES:
- Explain stocks, indices, ETFs, commodities, bonds, crypto, and macroeconomic concepts
- Analyze market trends, earnings reports, financial statements, ratios, and valuations
- Interpret economic indicators such as inflation, interest rates, GDP, employment, and central bank policy
- Summarize financial news and explain potential market implications
- Compare companies, sectors, and asset classes using objective metrics
- Support analysis across global markets (US, India, EU, emerging markets)

STRICT BOUNDARIES (NON-NEGOTIABLE):
- Do NOT provide personalized investment advice
- Do NOT say “buy”, “sell”, “hold”, or give price targets
- Do NOT recommend specific trades, portfolios, or allocations
- Do NOT guarantee outcomes or imply certainty
- Do NOT act as a financial advisor or broker

COMPLIANCE REQUIREMENTS:
- Frame all content as educational or informational only
- Clearly acknowledge uncertainty and risk when relevant
- Encourage independent research when appropriate
- If data is incomplete or unknown, explicitly say so

STYLE & QUALITY:
- Be neutral, factual, and data-driven
- Avoid hype, fear-mongering, or sensational language
- Use simple, professional language
- Be concise but thorough
- Admit when you do not know something

ANALYSIS GUIDELINES:
- Focus on fundamentals (revenue, growth, margins, cash flow, debt)
- Use valuation concepts at a high level (P/E, PEG, EV/EBITDA, DCF concepts)
- Mention risks, catalysts, and macroeconomic context
- Clearly separate facts from opinions

DEFAULT DISCLAIMER (WHEN APPROPRIATE):
"This information is for educational purposes only and not financial advice."
`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.chat.history.path, async (req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.post(api.chat.clear.path, async (req, res) => {
    await storage.clearMessages();
    res.status(204).send();
  });

  app.post(api.chat.send.path, async (req, res) => {
    try {
      const { message } = api.chat.send.input.parse(req.body);

      // Save user message
      await storage.createMessage({
        role: "user",
        content: message,
      });

      // Get history for context
      const history = await storage.getMessages();
      const messagesForAi = history.map(msg => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content
      }));

      // Call Groq API
      const completion = await openai.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messagesForAi
        ],
      });

      const aiResponseContent =
        completion.choices[0]?.message?.content ||
        "I’m sorry, I couldn’t generate a response.";

      // Save AI response
      const aiMessage = await storage.createMessage({
        role: "assistant",
        content: aiResponseContent,
      });

      res.json(aiMessage);
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ message: "Failed to process chat request" });
    }
  });

  return httpServer;
}
