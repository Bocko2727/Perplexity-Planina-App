import { useEffect, useRef, useState } from "react";
import { Bot, Send, Trash2, X } from "lucide-react";
import type { ChatMessage } from "../../lib/ai/types";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  isThinking: boolean;
  onAsk: (question: string) => void;
  onClear: () => void;
  suggestions: string[];
}

function TypingIndicator() {
  return (
    <div className="bg-white text-stone-800 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%] border border-stone-200 flex gap-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-2 h-2 rounded-full bg-stone-400 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

export function ChatPanel({
  isOpen,
  onClose,
  messages,
  isThinking,
  onAsk,
  onClear,
  suggestions,
}: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isThinking]);

  const send = (text: string) => {
    if (!text.trim() || isThinking) return;
    onAsk(text);
    setDraft("");
  };

  return (
    <div
      role="dialog"
      aria-label="AI Асистент"
      aria-hidden={!isOpen}
      className={`fixed top-0 right-0 bottom-0 z-50 w-full md:w-96 flex flex-col bg-stone-50 shadow-2xl transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="bg-emerald-900 text-white p-4 flex items-center gap-2">
        <Bot size={20} className="text-emerald-300" />
        <span className="font-bold flex-1">🤖 AI Асистент</span>
        <button
          data-testid="button-ai-clear"
          onClick={onClear}
          aria-label="Изчисти разговора"
          className="p-1 rounded hover:bg-emerald-800"
        >
          <Trash2 size={18} />
        </button>
        <button
          data-testid="button-ai-close"
          onClick={onClose}
          aria-label="Затвори"
          className="p-1 rounded hover:bg-emerald-800"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50">
        {messages.map((m) => (
          <div key={m.id} className="flex">
            <div
              title={new Date(m.timestamp).toLocaleTimeString("bg-BG")}
              className={
                m.role === "user"
                  ? "bg-emerald-800 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%] ml-auto whitespace-pre-wrap"
                  : "bg-white text-stone-800 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%] border border-stone-200 whitespace-pre-wrap"
              }
            >
              {m.text}
            </div>
          </div>
        ))}
        {isThinking && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="flex flex-wrap gap-2 p-3 border-t border-stone-100 bg-stone-50">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="text-sm border border-emerald-300 text-emerald-700 rounded-full px-3 py-1 hover:bg-emerald-50 cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white border-t border-stone-200 p-3 flex items-center gap-2">
        <textarea
          data-testid="input-ai-message"
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(draft);
            }
          }}
          placeholder="Попитай нещо..."
          aria-label="Съобщение"
          className="flex-1 resize-none rounded-full border border-stone-300 px-4 py-2 focus:outline-none focus:border-emerald-500"
        />
        <button
          data-testid="button-ai-send"
          onClick={() => send(draft)}
          disabled={!draft.trim() || isThinking}
          aria-label="Изпрати"
          className="bg-emerald-700 text-white rounded-full px-4 py-2 hover:bg-emerald-800 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
