const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

function resolveGroqModelFromAlias(alias) {
  const key = (alias || "").toString().trim().toLowerCase();
  switch (key) {
    case "gpt-5.1-codex-max":
    case "gpt-5.1-codex-max (preview)":
      return "llama-3.3-70b-versatile";
    case "llama-3.3-70b-versatile":
      return "llama-3.3-70b-versatile";
    case "llama-3.1-8b-instant":
      return "llama-3.1-8b-instant";
    default:
      return "llama-3.3-70b-versatile";
  }
}

export function resolveGroqModel() {
  return resolveGroqModelFromAlias(process.env.AI_MODEL_ALIAS);
}

async function callGroq(messages, { temperature = 0.7, max_tokens = 1024 } = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY");

  const model = resolveGroqModel();

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens }),
  });

  if (!res.ok) {
    let detail = await res.text().catch(() => "");
    try { detail = JSON.parse(detail).error?.message || detail; } catch {}
    throw new Error(`Groq API error: ${detail || res.statusText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return text;
}

export async function aiChat(prompt, opts) {
  const text = await callGroq([{ role: "user", content: prompt }], opts);
  return text.trim();
}

export async function aiJSON(prompt, opts) {
  const text = await aiChat(prompt, opts);
  const cleaned = text.replace(/```(?:json)?\n?|```/g, "").trim();

  // Try strict JSON first
  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  // Lenient parsing: extract JSON object and fix common issues
  const repaired = repairJSON(cleaned);
  return JSON.parse(repaired);
}

function repairJSON(input) {
  let s = (input || "").trim();
  // Normalize smart quotes
  s = s
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');
  // Extract the largest balanced JSON object if extra text surrounds it
  const extracted = extractBalancedJSON(s);
  s = extracted || s;
  // Remove trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, "$1");
  // Remove stray backslashes before quotes (common from markdown escapes)
  s = s.replace(/\\+\"/g, '"');
  return s;
}

function extractBalancedJSON(s) {
  const start = s.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return s.slice(start, i + 1);
      }
    }
  }
  return null;
}
