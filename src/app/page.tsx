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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

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

      if (!res.ok) throw Error("Erro na API");
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
    <div className="min-h-screen w-full overflow-x-hidden font-sans flex flex-col bg-black text-white">
      <header className="w-full text-center py-8 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] opacity-10 mix-blend-overlay"></div>
        <h1 className="text-5xl font-extrabold tracking-tight flex items-center justify-center gap-3 drop-shadow-md relative z-10">
          <span className="transform -rotate-6 animate-pulse-slow">🍕</span>
          <span>PizzAIria</span>
        </h1>
        <p className="text-base mt-4 font-light">Peça sua pizza favorita!</p>
        <div className="absolute top-0 left-0 w-24 h-24 rounded-full opacity-5 blur-xl -translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-5 blur-xl translate-x-16 translate-y-16"></div>
      </header>

      <main className="flex-1 flex items-center justify-center py-8 overflow-x-hidden">
        <div className="w-[90%] max-w-3xl h-[75vh] rounded-3xl shadow-xl flex flex-col overflow-hidden border border-gray-200 transform transition-all duration-300 ease-in-out hover:shadow-2xl bg-black">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 rounded-xl shadow-inner scrollbar-none"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.from === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-5 py-3 rounded-2xl text-base max-w-[75%] whitespace-pre-wrap shadow-sm font-normal leading-relaxed transition-all duration-200 ease-in-out transform hover:scale-[1.01] ${
                      msg.from === "user"
                        ? "bg-amber-200 text-amber-900 rounded-br-none"
                        : "bg-gradient-to-tr from-orange-500 to-red-500 text-white rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-5 py-3 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 text-white text-sm shadow animate-pulse">
                    Digitando...
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={sendMessage}
              className="px-6 py-4 bg-black border-t border-gray-800"
            >
              <div className="flex gap-4 items-center">
                <input
                  ref={inputRef}
                  autoFocus
                  disabled={loading}
                  type="text"
                  className="flex-1 px-5 py-3 rounded-full shadow-sm focus:outline-none focus:ring-3 focus:ring-orange-300 placeholder-gray-500 text-base text-black transition-all duration-200"
                  value={input}
                  placeholder="O que você gostaria de pedir?"
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-7 py-3 rounded-full transition-all duration-200 ease-in-out font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-95"
                  disabled={loading}
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
