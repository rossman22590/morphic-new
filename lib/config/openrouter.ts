export const OPENROUTER_DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1'

export function getOpenRouterBaseUrl(): string {
  return process.env.OPENROUTER_BASE_URL || OPENROUTER_DEFAULT_BASE_URL
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
