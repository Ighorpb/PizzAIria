# 🍕 PizzAIria - Atendente Virtual de Pizzaria

PizzAIria é um aplicativo de chat inteligente que simula um atendente virtual para pedidos de pizzas, bebidas e sobremesas — desenvolvido com ❤️ usando **Next.js**, **TypeScript**, **OpenAI** e muito mais.

---

## 📸 Demonstração

![Chat Preview](./public/preview.png) <!-- Substitua pelo caminho correto -->

---

## ⚙️ Funcionalidades

- 🧠 Fluxo inteligente de pedidos com IA
- 🍕 Escolha pizzas (meio a meio, média ou grande)
- 🥤 Bebidas: Lata, 600ml ou 2L (ex: Coca, Guaraná)
- 🍮 Sobremesas: Pudim, Mousse, Sorvete
- 🏠 Busca automática de endereço via CEP
- 📱 Interface moderna e responsiva
- 🧾 Resumo do pedido com endereço e forma de pagamento

---

## 🛠️ Tecnologias Utilizadas

- ⚛️ [Next.js](https://nextjs.org/)
- 👨‍💻 [React](https://reactjs.org/)
- 🔠 [TypeScript](https://www.typescriptlang.org/)
- 🎨 [TailwindCSS](https://tailwindcss.com/)
- 🧠 [OpenAI API](https://platform.openai.com/)
- 🌎 [ViaCEP](https://viacep.com.br/)
- 🧬 [Prisma ORM](https://prisma.io/) (opcional)

---

## 📦 Como Rodar o Projeto

```bash
# Instalar dependências
npm install

# Rodar em ambiente de desenvolvimento
npm run dev
```

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Chave da API da OpenAI
OPENAI_API_KEY=sua_chave_openai_aqui

# Opcional: URL do banco de dados (Prisma)
DATABASE_URL=postgres://usuario:senha@host:porta/banco
```

---

## 📚 Estrutura do Projeto

```
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   └── api/
│   ├── controllers/
│   ├── services/
│   └── types/
├── test/
│   ├── cep.service.test.ts
│   └── message.service.test.ts
├── public/
│   └── preview.png
├── jest.config.js
└── README.md
```

## 📣 Autor

Feito com 🍕, ☕ e OpenAI por Ighor.

---

## 📝 Licença

Licença MIT — Sinta-se livre para usar, modificar e compartilhar!
