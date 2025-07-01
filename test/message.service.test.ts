import { messageService } from "@/app/services/message.service";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    message: {
      create: jest.fn(),
    },
  },
}));

process.env.OPENAI_API_KEY = "test-key";

describe("messageService.processMessages", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("envia mensagens para a OpenAI e retorna a resposta do bot", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "Sim, temos Calabresa e Quatro Queijos. Qual tamanho?",
            },
          },
        ],
      }),
    });

    const result = await messageService.processMessages([
      { from: "user", text: "Tem pizza metade calabresa e metade 4 queijos?" },
    ]);

    expect(result).toBe("Sim, temos Calabresa e Quatro Queijos. Qual tamanho?");
    expect(fetch).toHaveBeenCalled();
    expect(prisma.message.create).toHaveBeenCalledTimes(2);
  });

  it("retorna erro genérico se resposta da OpenAI falhar", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(
      messageService.processMessages([{ from: "user", text: "Oi" }])
    ).rejects.toThrow("Erro ao acessar OpenAI");
  });
});
