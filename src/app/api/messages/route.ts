import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ChatMessage = { from: "user" | "bot"; text: string };

export async function POST(req: NextRequest) {
  const { messages }: { messages: ChatMessage[] } = await req.json();

  const systemPrompt = {
    role: "system",
    content: `
Você é um atendente virtual de uma pizzaria. 
Siga estas regras ao conversar:
- Só pode oferecer e sugerir itens do cardápio: pizzas (Margherita, Calabresa, Portuguesa, Quatro Queijos, Frango com Catupiry), bebidas (Refrigerante, Suco, Água, Cerveja) e sobremesas (Pudim, Mousse, Sorvete).
- Não ofereça, cite ou sugira nada que não esteja na lista acima. Não fale sobre descontos, promoções ou brindes.
- Seja simpático, persuasivo e estratégico para realizar a venda da pizza, usando linguagem envolvente mas sem ser agressivo.
- Se o cliente não pedir bebida, sempre ofereça pelo menos uma opção.
- Se ele pedir bebida, ofereça uma sobremesa.
- Se recusar, tente sugerir outro item do mesmo grupo (ex: outra bebida ou sobremesa).
- Nunca saia do contexto de pizzaria.
- Responda sempre de forma simpática, clara e curta, sem exagerar nos detalhes ou floreios. Use frases diretas e evite mensagens muito longas.
Responda sempre em português do Brasil.
    `,
  };

  const openAiMessages = [
    systemPrompt,
    ...messages.map((m: ChatMessage) => ({
      role: m.from === "user" ? "user" : "assistant",
      content: m.text,
    })),
  ];

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { reply: "Chave da OpenAI não configurada." },
      { status: 500 }
    );
  }

  const body = {
    model: "gpt-3.5-turbo",
    messages: openAiMessages,
    temperature: 0.3,
    max_tokens: 300,
  };

  const lastUser = messages[messages.length - 1];
  await prisma.message.create({
    data: {
      from: lastUser.from,
      text: lastUser.text,
    },
  });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json(
      { reply: "Erro ao acessar a OpenAI." },
      { status: 500 }
    );
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? "Desculpe, não entendi.";

  await prisma.message.create({
    data: {
      from: "bot",
      text: reply,
    },
  });

  return NextResponse.json({ reply });
}

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, from: true, text: true, createdAt: true },
    });
    return NextResponse.json(messages, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar histórico de mensagens." },
      { status: 500 }
    );
  }
}
