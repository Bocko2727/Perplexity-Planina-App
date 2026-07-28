import { useCallback, useRef, useState } from "react";
import { QUICK_SUGGESTIONS } from "../lib/ai/suggestions";
import type { ChatMessage } from "../lib/ai/types";
import { askAssistantDetailed } from "../services/aiService";

const WELCOME_TEXT =
  "Здравей! Аз съм твоят планински асистент. Мога да помогна с:\n\n" +
  "• Избор на маршрут по трудност, регион или сезон\n" +
  "• Препоръки за уикенда\n" +
  "• Съвети за оборудване\n" +
  "• Планиране на преходи\n\n" +
  "Попитай ме нещо!";

function welcomeMessage(): ChatMessage {
  return { id: "welcome", role: "assistant", text: WELCOME_TEXT, timestamp: Date.now() };
}

export function useAIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage()]);
  const [isThinking, setIsThinking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const counter = useRef(0);

  const nextId = useCallback((prefix: string) => {
    counter.current += 1;
    return `${prefix}-${counter.current}`;
  }, []);

  const ask = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (!text) return;

      setMessages((prev) => [
        ...prev,
        { id: nextId("user"), role: "user", text, timestamp: Date.now() },
      ]);
      setIsThinking(true);

      try {
        const answer = await askAssistantDetailed(text);
        setMessages((prev) => [
          ...prev,
          {
            id: nextId("assistant"),
            role: "assistant",
            text: answer.text,
            routeRefs: answer.routeRefs,
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [nextId]
  );

  const clear = useCallback(() => {
    setMessages([welcomeMessage()]);
  }, []);

  return { messages, isThinking, isOpen, setIsOpen, ask, clear, suggestions: QUICK_SUGGESTIONS };
}
