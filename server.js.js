console.log("SERVER FILE LOADED");

import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/api/test", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are LifeAdmin AI. Be direct. Give 1–3 clear actions.",
        },
        { role: "user", content: text },
      ],
    });

    res.json({ result: completion.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: "AI error" });
  }
});

app.post("/api/checkout", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: "http://localhost:3000",
    cancel_url: "http://localhost:3000",
  });

  res.json({ url: session.url });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});


