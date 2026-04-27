const BASE_URL = import.meta.env.VITE_AI_BASE_URL || "https://api.openai.com/v1"
const MODEL = import.meta.env.VITE_AI_MODEL || "gpt-4o-mini"
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY

export async function getAiResponse(prompt, options = {}) {
  if (!API_KEY) {
    throw new Error("Missing VITE_OPENAI_API_KEY in your .env file.")
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    signal: options.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const rawError = await response.text()
    throw new Error(`AI request failed (${response.status}): ${rawError}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || "No response content returned."
}
