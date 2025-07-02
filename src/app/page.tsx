"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/types/message";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: "bot",
      text: "Olá! Bem-vindo à Pizzaria Virtual 🍕. Como posso te ajudar hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  useEffect(() => {
    if (showHistory) fetchHistory();
  }, [showHistory]);

  async function fetchHistory() {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setHistory(data);
    } catch {
      console.error("Erro ao buscar histórico");
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { from: "user", text: input.trim() };
    const updatedMessages: ChatMessage[] = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const shortHistory: ChatMessage[] = updatedMessages.slice(-20);
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
        <button
          className="absolute right-8 top-8 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-full z-20"
          onClick={() => setShowHistory(true)}
        >
          Ver histórico
        </button>
        <p className="text-base mt-4 font-light">Peça sua pizza favorita!</p>
      </header>

      <main className="flex-1 flex items-center justify-center py-8 overflow-x-hidden">
        <div className="w-[90%] max-w-3xl h-[75vh] rounded-3xl shadow-xl flex flex-col overflow-hidden border border-gray-200 bg-black">
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
                    className={`px-5 py-3 rounded-2xl text-base max-w-[75%] whitespace-pre-wrap shadow-sm leading-relaxed transition-all transform hover:scale-[1.01] ${
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
                  className="flex-1 px-5 py-3 rounded-full text-black text-base placeholder-gray-500"
                  value={input}
                  placeholder="O que você gostaria de pedir?"
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-7 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-end">
          <div className="w-full max-w-md bg-white text-black h-full p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Histórico de Conversas</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-red-600 font-semibold"
              >
                Fechar
              </button>
            </div>
            {(() => {
              const sessions: ChatMessage[][] = [];
              let current: ChatMessage[] = [];

              const sorted = [...history].sort(
                (a, b) =>
                  new Date(b.createdAt!).getTime() -
                  new Date(a.createdAt!).getTime()
              );

              sorted.forEach((msg, i) => {
                const prev = sorted[i - 1];
                const diff =
                  prev && msg.createdAt && prev.createdAt
                    ? new Date(prev.createdAt).getTime() -
                      new Date(msg.createdAt).getTime()
                    : 0;

                if (diff > 5 * 60 * 1000) {
                  if (current.length) sessions.push(current);
                  current = [];
                }

                current.push(msg);
              });

              if (current.length) sessions.push(current);

              return (
                <ul className="space-y-6">
                  {sessions.map((session, idx) => (
                    <li key={idx}>
                      <h3 className="text-base font-semibold text-orange-600 mb-2">
                        Conversa {sessions.length - idx}
                      </h3>
                      <ul className="space-y-2">
                        {session.map((msg) => (
                          <li key={msg.id} className="text-sm border-b pb-2">
                            <strong>
                              {msg.from === "user" ? "🧑 Cliente" : "🤖 Bot"}:
                            </strong>{" "}
                            {msg.text}
                          </li>
                        ))}
                      </ul>
                      <hr className="mt-4 border-gray-300" />
                    </li>
                  ))}
                </ul>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
