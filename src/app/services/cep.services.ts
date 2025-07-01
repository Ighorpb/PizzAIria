export const cepService = {
  async lookup(cep: string): Promise<{ rua: string }> {
    const onlyNumbers = cep.replace(/\D/g, "");

    const response = await fetch(
      `https://viacep.com.br/ws/${onlyNumbers}/json/`
    );
    const data = await response.json();

    if (data.erro) throw new Error("CEP não encontrado");

    return { rua: data.logradouro };
  },
};
