import { anthropic } from '@ai-sdk/anthropic'
import { createGateway } from '@ai-sdk/gateway'
import { google } from '@ai-sdk/google'
import { createOpenAI, openai } from '@ai-sdk/openai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { createProviderRegistry, LanguageModel } from 'ai'
import { createOllama } from 'ai-sdk-ollama'

import {
  getOpenRouterAppName,
  getOpenRouterAppUrl,
  getOpenRouterBaseUrl
} from '@/lib/config/openrouter'

// Build providers object conditionally
const providers: Record<string, any> = {
  openai,
  anthropic,
  google,
  openrouter: createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: getOpenRouterBaseUrl(),
    appName: getOpenRouterAppName(),
    appUrl: getOpenRouterAppUrl()
  }),
  'openai-compatible': createOpenAI({
    apiKey: process.env.OPENAI_COMPATIBLE_API_KEY,
    baseURL: process.env.OPENAI_COMPATIBLE_API_BASE_URL
  }),
  gateway: createGateway({
    apiKey: process.env.AI_GATEWAY_API_KEY
  })
}

// Only add Ollama if OLLAMA_BASE_URL is configured
const ollamaProvider = process.env.OLLAMA_BASE_URL
  ? createOllama({ baseURL: process.env.OLLAMA_BASE_URL })
  : null

if (ollamaProvider) {
  providers.ollama = ollamaProvider
}

export const registry = createProviderRegistry(providers)

export function getModel(model: string): LanguageModel {
  // For Ollama models, bypass the registry to pass model-level settings
  // that ai-sdk-ollama requires (think, supportedUrls override).
  if (model.startsWith('ollama:') && ollamaProvider) {
    const modelId = model.slice('ollama:'.length)
    const lm = ollamaProvider(modelId, { think: true })

    // Ollama's Chat API only accepts base64 in the images field, not URLs.
    // Override supportedUrls to force AI SDK to download images and convert
    // them to base64 before sending to the model.
    Object.defineProperty(lm, 'supportedUrls', {
      value: {},
      configurable: true
    })

    return lm
  }

  return registry.languageModel(
    model as Parameters<typeof registry.languageModel>[0]
  )
}

export function isProviderEnabled(providerId: string): boolean {
  const routeAllLlmUsageThroughOpenRouter = !!process.env.OPENROUTER_API_KEY

  switch (providerId) {
    case 'openrouter':
      return !!process.env.OPENROUTER_API_KEY
    case 'openai':
      if (routeAllLlmUsageThroughOpenRouter) return false
      return !!process.env.OPENAI_API_KEY
    case 'anthropic':
      if (routeAllLlmUsageThroughOpenRouter) return false
      return !!process.env.ANTHROPIC_API_KEY
    case 'google':
      if (routeAllLlmUsageThroughOpenRouter) return false
      return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
    case 'openai-compatible':
      if (routeAllLlmUsageThroughOpenRouter) return false
      return (
        !!process.env.OPENAI_COMPATIBLE_API_KEY &&
        !!process.env.OPENAI_COMPATIBLE_API_BASE_URL
      )
    case 'gateway':
      if (routeAllLlmUsageThroughOpenRouter) return false
      return !!process.env.AI_GATEWAY_API_KEY
    case 'ollama':
      if (routeAllLlmUsageThroughOpenRouter) return false
      return !!process.env.OLLAMA_BASE_URL
    default:
      return false
  }
}
