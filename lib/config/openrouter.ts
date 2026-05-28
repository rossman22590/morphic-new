export const OPENROUTER_DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1'
export const TOP_OPENROUTER_MODEL_IDS = [
  'anthropic/claude-sonnet-4.6',
  'google/gemini-3.5-flash',
  'openai/gpt-chat-latest',
  'x-ai/grok-4.3',
  'openai/gpt-5.5',
  'openai/gpt-5.4-mini',
  'anthropic/claude-haiku-4.5',
  'deepseek/deepseek-v4-flash',
  'minimax/minimax-m2.7',
  'z-ai/glm-5.1'
] as const

const TOP_OPENROUTER_MODEL_ID_SET = new Set<string>(TOP_OPENROUTER_MODEL_IDS)

export function getOpenRouterBaseUrl(): string {
  return process.env.OPENROUTER_BASE_URL || OPENROUTER_DEFAULT_BASE_URL
}

export function isTopOpenRouterModel(modelId: string): boolean {
  return TOP_OPENROUTER_MODEL_ID_SET.has(modelId)
}

export function getTopOpenRouterModelRank(modelId: string): number {
  const index = TOP_OPENROUTER_MODEL_IDS.indexOf(
    modelId as (typeof TOP_OPENROUTER_MODEL_IDS)[number]
  )

  return index >= 0 ? index : Number.MAX_SAFE_INTEGER
}

export function getOpenRouterAppUrl(): string | undefined {
  return (
    process.env.OPENROUTER_HTTP_REFERER ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL
  )
}

export function getOpenRouterAppName(): string {
  return process.env.OPENROUTER_APP_NAME || 'AI Search'
}

export function getOpenRouterHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const referer = getOpenRouterAppUrl()
  const appTitle = getOpenRouterAppName()

  if (referer) {
    headers['HTTP-Referer'] = referer
  }

  if (appTitle) {
    headers['X-OpenRouter-Title'] = appTitle
  }

  return headers
}
