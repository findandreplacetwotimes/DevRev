const BASE_URL = import.meta.env.VITE_AI_BASE_URL || "https://api.openai.com/v1"
const MODEL = import.meta.env.VITE_AI_MODEL || "gpt-4o-mini"
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY

export async function getAiResponse(prompt, options = {}) {
  // Mock mode for testing without API key
  if (!API_KEY) {
    console.warn("No API key found - using mock responses")
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay
    return "Thanks for reaching out! I'm Computer, currently running in demo mode. Add your API key to .env.local (VITE_OPENAI_API_KEY) to enable real AI responses."
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  }

  // OpenRouter needs these additional headers
  if (BASE_URL.includes('openrouter.ai')) {
    headers["HTTP-Referer"] = window.location.origin
    headers["X-Title"] = "DevRev Project Chat"
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    signal: options.signal,
    headers,
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const rawError = await response.text()
    console.error("AI API Error:", rawError)
    throw new Error(`AI request failed (${response.status}): ${rawError}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || "No response content returned."
}
