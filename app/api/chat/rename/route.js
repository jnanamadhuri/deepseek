import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

    const { chatId, name } = await req.json();

    //   connection with DB and update name
    await connectDB();
    await Chat.findOneAndUpdate({ _id: chatId, userId }, { name });

    return NextResponse.json({ success: true, message: "chat Renamed" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
