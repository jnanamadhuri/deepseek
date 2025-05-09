// File: app/api/chats/ai/route.js

import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 60;

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req) {
  try {
    const auth = getAuth(req);
    const userId = auth.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "No authentication" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { chatId, prompt } = body;

    await connectDB();
    const data = await Chat.findOne({ userId, _id: chatId });

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Chat not found" },
        { status: 404 }
      );
    }

    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    data.messages.push(userPrompt); // Update in-place

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [{ role: "user", content: prompt }],
      store: true,
    });

    const message = completion.choices[0].message;
    message.timestamp = Date.now();

    data.messages.push(message); // Append assistant response
    await data.save();

    return NextResponse.json({ success: true, data: message }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
