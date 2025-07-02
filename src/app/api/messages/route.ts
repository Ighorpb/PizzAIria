import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const systemPrompt = {
  role: "system",
  content: `
Você é um atendente virtual de uma pizzaria. Responda sempre em português do Brasil.

📌 Regras gerais:
- Nunca inicie com bebida ou sobremesa. Sempre comece pelo pedido de pizza.
- Ofereça apenas os itens a seguir:
  🍕 Pizzas: Margherita, Calabresa, Portuguesa, Quatro Queijos, Frango com Catupiry
  🥤 Bebidas: Refrigerante lata (R$ 6), 600ml (R$ 8), 2 litros (R$ 10) – Coca, Guaraná
  🍮 Sobremesas: Pudim (R$ 12), Mousse (R$ 10), Sorvete (R$ 15)
- Nunca ofereça produtos fora dessa lista ou mencione promoções.
- Frases curtas, simpáticas, objetivas e dentro do contexto de pizzaria.
- Sempre incentive a continuar o pedido (cross-selling de bebida e sobremesa).

⚠️ Fluxo obrigatório:
1. Comece perguntando o sabor da pizza.
2. Depois, pergunte se deseja meio a meio.
3. Só então pergunte o tamanho: média ou grande.
4. Informe o preço com base no tamanho após a confirmação.
5. Depois, pergunte sobre bebida (tipo e tamanho).
6. Em seguida, pergunte sobre sobremesa.
7. Pergunte o CEP.
8. Ao receber o CEP, busque a rua automaticamente (ex: "CEP 74620385 corresponde à Rua 3. Está correto?").
9. Peça os dados: número, quadra, lote, complemento.
10. Por fim, pergunte a forma de pagamento: Pix, dinheiro ou cartão (crédito/débito).

✅ Regras adicionais:
- Pizza média custa R$ 40.
- Pizza grande custa R$ 65.
- É permitido meio a meio.
- Seja claro, e peça confirmação em cada etapa.
- Nunca pule etapas.

🛑 Não fale de promoções, cupons ou preços diferentes dos definidos.
`,
};

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: { from: "user" | "bot"; text: string }[] } =
      await req.json();

    const openAiMessages = [
      systemPrompt,
      ...messages.map((m) => ({
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

    const lastUser = messages[messages.length - 1];
    await prisma.message.create({
      data: { from: lastUser.from, text: lastUser.text },
    });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: openAiMessages,
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { reply: "Erro ao acessar a OpenAI." },
        { status: 500 }
      );
    }

    const data = await res.json();
    const reply =
      data.choices?.[0]?.message?.content ?? "Desculpe, não entendi.";

    await prisma.message.create({ data: { from: "bot", text: reply } });

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, from: true, text: true, createdAt: true },
    });
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar histórico" },
      { status: 500 }
    );
  }
}
