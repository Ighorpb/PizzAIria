import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ChatMessage = { from: "user" | "bot"; text: string };

export async function POST(req: NextRequest) {
  const { messages }: { messages: ChatMessage[] } = await req.json();

  const systemPrompt = {
    role: "system",
    content: `
  Você é um atendente virtual de uma pizzaria. Responda sempre em português do Brasil.
  
  Siga estas regras ao conversar:
  - Ofereça apenas pizzas (Margherita, Calabresa, Portuguesa, Quatro Queijos, Frango com Catupiry), bebidas (Refrigerante Lata, 600ml ou 2 Litros — Coca, Guaraná, etc.) e sobremesas (Pudim, Mousse, Sorvete).
  - Nunca ofereça itens fora dessa lista. Não fale sobre descontos ou promoções.
  - Seja direto, educado e simpático. Frases curtas, sem exageros.
  - Se o cliente pedir pizza, ofereça bebida. Se pedir bebida, ofereça sobremesa.
  - Caso recuse, sugira outro item do mesmo grupo.
  - Nunca saia do contexto de pizzaria.
  
  ⚠️ **Fluxo obrigatório:**
  1. Primeiro, colete a escolha da pizza.
  2. Depois, pergunte sobre bebida.
  3. Depois, pergunte sobre sobremesa.
  4. Somente **após o cliente responder sobre a sobremesa** (ou recusar), pergunte o CEP para o endereço.
  
  Ao receber o CEP:
  - Busque a rua correspondente automaticamente (ex: “CEP 74620-385 corresponde à Rua 3. Está correto?”).
  - Peça os dados restantes: número, quadra, lote, complemento.
  
  🛑 Nunca mencione valores.
  ✅ Seu foco é **coletar o pedido completo e o endereço** com clareza.
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
