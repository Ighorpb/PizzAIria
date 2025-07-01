import { NextRequest, NextResponse } from "next/server";
import { cepService } from "../services/cep.services";

async function handle(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cep = searchParams.get("cep");

  if (!cep || typeof cep !== "string") {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  try {
    const result = await cepService.lookup(cep);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar o CEP" },
      { status: 500 }
    );
  }
}

export const cepController = { handle };
