import { parseQuery } from "../lib/ai/query-parser";
import { buildResponse } from "../lib/ai/response-builder";
import { matchRoutes } from "../lib/ai/route-matcher";

export interface AssistantAnswer {
  text: string;
  routeRefs: string[];
}

const EDGE_FUNCTION_URL =
  "https://mdqucjligktvfoxlxwcz.supabase.co/functions/v1/ai-assistant";

const FALLBACK_MIN_DELAY_MS = 500;
const FALLBACK_MAX_EXTRA_DELAY_MS = 1000;

function think(): Promise<void> {
  const delay = FALLBACK_MIN_DELAY_MS + Math.random() * FALLBACK_MAX_EXTRA_DELAY_MS;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/** Call the LLM-powered Edge Function. Returns null on any failure. */
async function askLLM(question: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    if (typeof data.answer === "string" && data.answer.length > 0) {
      return data.answer;
    }
    return null;
  } catch {
    return null;
  }
}

/** Rule-based fallback — uses only local route data, no network calls. */
async function askRuleBased(question: string): Promise<AssistantAnswer> {
  await think();
  const query = parseQuery(question);
  const matches = matchRoutes(query);
  return {
    text: buildResponse(matches, query),
    routeRefs:
      query.intent === "gear_advice" ? [] : matches.map((match) => String(match.route.id)),
  };
}

/** Answer a question and report which real routes the answer is based on. */
export async function askAssistantDetailed(question: string): Promise<AssistantAnswer> {
  // Try LLM first (Edge Function calls Perplexity API with real route data)
  const llmAnswer = await askLLM(question);
  if (llmAnswer) {
    return { text: llmAnswer, routeRefs: [] };
  }

  // Fallback: rule-based system (works offline, no API needed)
  return askRuleBased(question);
}

export async function askAssistant(question: string): Promise<string> {
  const answer = await askAssistantDetailed(question);
  return answer.text;
}
