import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cep = searchParams.get("cep");

  if (!cep || typeof cep !== "string") {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`
    );
    const data = await response.json();

    if (data.erro) {
      return NextResponse.json(
        { error: "CEP não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ rua: data.logradouro });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar CEP" }, { status: 500 });
  }
}
