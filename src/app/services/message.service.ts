import { ChatMessage } from "@/types/message";
import { prisma } from "@/lib/prisma";
import { cepService } from "./cep.services";

const systemPrompt = {
  role: "system",
  content: `
Você é um atendente virtual de uma pizzaria. Responda sempre em português do Brasil.

Regras de atendimento:
- Só ofereça pizzas (Margherita, Calabresa, Portuguesa, Quatro Queijos, Frango com Catupiry), bebidas (Refrigerante Lata, 600 ml ou 2 L — Coca-Cola, Guaraná) e sobremesas (Pudim, Mousse, Sorvete).
- Não ofereça bebida ou sobremesa até que o cliente tenha pedido ao menos uma pizza.
- Se o cliente recusar pizza, continue oferecendo educadamente outros sabores disponíveis.
- Permita que o cliente escolha pizza média (R$ 40) ou grande (R$ 65), inclusive meio a meio (ex: metade Calabresa e metade Quatro Queijos).
- Se o cliente escolher pagamento em dinheiro, **não mencione máquina de cartão**.
- Se o cliente escolher cartão, diga que o entregador levará a máquina.
- Se escolher Pix, diga que o QR Code será enviado ou estará com o entregador.
- Nunca mencione descontos, promoções ou valores diferentes desses.
- Seja educado, simpático e direto. Frases curtas e objetivas.

Fluxo obrigatório:
1. Aguarde o cliente pedir o sabor da pizza.
2. Mesmo que o cliente já tenha mencionado um sabor, sempre pergunte o tamanho desejado: média (R$ 40) ou grande (R$ 65).
3. Pergunte se quer pizza inteira ou meio a meio (ex: dois sabores).
4. Depois, ofereça bebida:
   - Primeiro pergunte se deseja: Lata, 600 ml ou 2 litros.
   - Depois pergunte o sabor: Coca-Cola ou Guaraná.
5. Depois, ofereça sobremesa.
6. Após isso, solicite o CEP.
7. Ao receber o CEP, busque a rua automaticamente e confirme com o cliente.
8. Solicite os dados restantes: número, complemento, etc.
9. Finalize perguntando qual será a forma de pagamento (ex: dinheiro, cartão, pix).

Apresente as opções de bebidas assim:
Temos refrigerantes nos seguintes tamanhos:
- Lata
- 600 ml
- 2 litros
Sabores disponíveis:
- Coca-Cola
- Guaraná

- Se o cliente já disser dois sabores juntos (ex: “metade Calabresa e metade Quatro Queijos”), entenda que ele deseja uma pizza meio a meio e não pergunte isso novamente.

🛑 Nunca saia do contexto de pizzaria.
✅ Foque em coletar o pedido completo (sabores, tamanhos, bebida, sobremesa, endereço e forma de pagamento).
  `,
};

async function processMessages(messages: ChatMessage[]): Promise<string> {
  const openAiMessages = [
    systemPrompt,
    ...messages.map((m) => ({
      role: m.from === "user" ? "user" : "assistant",
      content: m.text,
    })),
  ];

  const lastUser = messages[messages.length - 1];
  await prisma.message.create({
    data: { from: lastUser.from, text: lastUser.text },
  });

  const cepMatch = lastUser.text.match(/\b\d{5}-?\d{3}\b/);
  if (cepMatch) {
    try {
      const cep = cepMatch[0];
      const { rua } = await cepService.lookup(cep);
      openAiMessages.push({
        role: "system",
        content: `O endereço corresponde à rua ${rua}. Confirme essa informação com o cliente.`,
      });
    } catch {
      openAiMessages.push({
        role: "system",
        content: `O CEP informado parece inválido ou não encontrado. Peça ao cliente para confirmar ou reenviar.`,
      });
    }
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key ausente.");

  const body = {
    model: "gpt-3.5-turbo",
    messages: openAiMessages,
    temperature: 0.3,
    max_tokens: 300,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Erro ao acessar OpenAI");

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? "Desculpe, não entendi.";

  await prisma.message.create({ data: { from: "bot", text: reply } });

  return reply;
}

async function getMessages() {
  return prisma.message.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, from: true, text: true, createdAt: true },
  });
}

export const messageService = { processMessages, getMessages };
