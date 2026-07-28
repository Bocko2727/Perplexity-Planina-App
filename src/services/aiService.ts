import { parseQuery } from "../lib/ai/query-parser";
import { buildResponse } from "../lib/ai/response-builder";
import { matchRoutes } from "../lib/ai/route-matcher";

export interface AssistantAnswer {
  text: string;
  routeRefs: string[];
}

const MIN_DELAY_MS = 500;
const MAX_EXTRA_DELAY_MS = 1000;

function think(): Promise<void> {
  const delay = MIN_DELAY_MS + Math.random() * MAX_EXTRA_DELAY_MS;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/** Answer a question and report which real routes the answer is based on. */
export async function askAssistantDetailed(question: string): Promise<AssistantAnswer> {
  await think();
  const query = parseQuery(question);
  const matches = matchRoutes(query);
  return {
    text: buildResponse(matches, query),
    routeRefs: query.intent === "gear_advice" ? [] : matches.map((match) => String(match.route.id)),
  };
}

export async function askAssistant(question: string): Promise<string> {
  const answer = await askAssistantDetailed(question);
  return answer.text;
}
