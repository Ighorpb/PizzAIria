"use client";

import { useEffect, useRef, useState } from "react";

type Message = { from: "user" | "bot"; text: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "bot",
      text: "Olá! Bem-vindo à Pizzaria Virtual 🍕. Como posso te ajudar hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { from: "user", text: input.trim() };
    const updatedMessages: Message[] = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const shortHistory: Message[] = updatedMessages.slice(-20);

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: shortHistory }),
      });

      if (!res.ok) throw new Error("Erro na API");
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { from: "bot", text: data.reply ?? "Desculpe, não entendi." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Desculpe, tivemos um problema. Tente novamente em instantes.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-200 flex items-center justify-center px-4">
      <div className="w-full max-w-xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <header className="bg-pizzaria-primary text-white text-center py-6 shadow-md">
          <h1 className="text-3xl font-bold tracking-tight">
            🍕 Atendente da Pizzaria
          </h1>
          <p className="text-sm text-orange-100 mt-1">
            Fale comigo e peça sua pizza favorita!
          </p>
        </header>

        {/* Mensagens do chat */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-3 bg-white"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.from === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-5 py-3 rounded-xl max-w-[70%] text-sm whitespace-pre-wrap shadow ${
                  msg.from === "user"
                    ? "bg-pizzaria-secondary text-black rounded-br-none"
                    : "bg-pizzaria-primary text-white rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-5 py-3 rounded-xl max-w-[70%] bg-pizzaria-primary text-white text-sm shadow animate-pulse">
                Digitando...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex gap-2 items-center"
        >
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pizzaria-primary"
            value={input}
            placeholder="Digite sua mensagem..."
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-pizzaria-primary hover:bg-orange-600 text-white px-5 py-2 rounded-full transition-colors"
            disabled={loading}
          >
            Enviar
          </button>
        </form>
      </div>
    </main>
  );
}
