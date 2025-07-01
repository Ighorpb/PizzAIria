import { cepService } from "@/app/services/cep.services";

// mock global fetch
global.fetch = jest.fn();

describe("cepService.lookup", () => {
  it("retorna a rua correta quando o CEP é válido", async () => {
    const mockedResponse = {
      json: async () => ({ logradouro: "Rua Teste" }),
    };
    (fetch as jest.Mock).mockResolvedValue(mockedResponse);

    const result = await cepService.lookup("74620385");
    expect(result).toEqual({ rua: "Rua Teste" });
  });

  it("lança erro quando o CEP não é encontrado", async () => {
    const mockedResponse = {
      json: async () => ({ erro: true }),
    };
    (fetch as jest.Mock).mockResolvedValue(mockedResponse);

    await expect(cepService.lookup("00000000")).rejects.toThrow(
      "CEP não encontrado"
    );
  });
});
