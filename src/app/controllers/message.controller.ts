import { NextRequest, NextResponse } from "next/server";
import { messageService } from "../services/message.service";
import { ChatMessage } from "@/types/message";

async function handlePost(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();
    const reply = await messageService.processMessages(messages);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}

async function handleGet() {
  try {
    const history = await messageService.getMessages();
    return NextResponse.json(history);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar histórico" },
      { status: 500 }
    );
  }
}

export const messageController = { handlePost, handleGet };
