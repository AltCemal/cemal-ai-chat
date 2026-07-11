'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Selam! Ben Cemal'in dijital asistanıyım. Onun projeleri, deneyimleri veya ilgi alanları hakkında ne bilmek istersin?",
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: trimmedInput,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedInput }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: data.reply || 'Bir hata oluştu, lütfen tekrar dene.',
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), text: 'Sunucuya bağlanılamadı.', sender: 'bot' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#121214] p-4">
      <div className="flex h-[600px] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl bg-[#202024] shadow-2xl border border-[#323238]">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-[#29292e] px-5 py-4 border-b border-[#323238]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h1 className="font-semibold text-emerald-400 text-base">Cemal Altuntaş AI</h1>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white self-end rounded-tr-none'
                  : 'bg-[#29292e] text-[#e1e1e6] self-start rounded-tl-none border border-[#323238]'
              }`}
            >
              {msg.text}
            </div>
          ))}

          {/* Yazıyor... */}
          {isLoading && (
            <div className="bg-[#29292e] text-[#e1e1e6] self-start rounded-2xl rounded-tl-none border border-[#323238] px-4 py-2.5 text-sm max-w-[85%]">
              <div className="flex gap-1 items-center h-5">
                <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#29292e] border-t border-[#323238] flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bir şeyler sor..."
            className="flex-1 bg-[#121214] border border-[#323238] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            Gönder
          </button>
        </div>

      </div>
    </main>
  );
}