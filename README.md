# 🍕 PizzAIria - Atendente Virtual de Pizzaria

PizzAIria é um aplicativo de atendimento virtual que simula um chat inteligente para pedidos de pizza, bebidas e sobremesas. Desenvolvido com Next.js, TypeScript e OpenAI, ele oferece uma experiência moderna, interativa e automatizada.

---

## 📸 Demonstração

![Chat Preview](./public/preview.png) <!-- Substitua com seu caminho correto -->

---

## 🚀 Funcionalidades

- Chat interativo para pedidos
- Suporte a bebidas (lata, 600ml, 2L), sobremesas e pizzas
- Fluxo inteligente com perguntas automáticas
- Verificação de endereço via CEP (complemento, rua, quadra, lote)
- Interface responsiva e moderna

---

## 🛠️ Tecnologias

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [OpenAI API](https://platform.openai.com/)
- [Zippopotam.us API](https://api.zippopotam.us/) (CEP)
- [Prisma](https://www.prisma.io/) (opcional)

---

## 📦 Como executar

```bash
# Instalar dependências
npm install

# Rodar em ambiente de desenvolvimento
npm run dev
```

## 🧪 Variáveis de ambiente

Para o projeto funcionar corretamente, você precisa criar um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# 🔐 Chave da API OpenAI
OPENAI_API_KEY=sua-chave-da-openai

# 🌐 URL do banco de dados (se estiver utilizando Prisma)
DATABASE_URL=postgres://usuario:senha@host:porta/nome_do_banco

👨‍🍳 Desenvolvedor

Feito com 💛 por Ighor.

```
