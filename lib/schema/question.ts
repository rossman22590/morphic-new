import { z } from 'zod'

// Standard schema with optional fields for inputLabel and inputPlaceholder
export const questionSchema = z.object({
  question: z.string().describe('The main question to ask the user'),
  options: z
    .array(
      z.object({
        value: z.string().describe('Option identifier (always in English)'),
        label: z.string().describe('Display text for the option')
      })
    )
    .describe('List of predefined options'),
  allowsInput: z.boolean().describe('Whether to allow free-form text input'),
  inputLabel: z.string().optional().describe('Label for free-form input field'),
  inputPlaceholder: z
    .string()
    .optional()
    .describe('Placeholder text for input field')
})

// Strict schema with all fields required, for specific models like o3-mini
export const strictQuestionSchema = z.object({
  question: z.string().describe('The main question to ask the user'),
  options: z
    .array(
      z.object({
        value: z.string().describe('Option identifier (always in English)'),
        label: z.string().describe('Display text for the option')
      })
    )
    .describe('List of predefined options'),
  allowsInput: z.boolean().describe('Whether to allow free-form text input'),
  inputLabel: z.string().describe('Label for free-form input field'),
  inputPlaceholder: z.string().describe('Placeholder text for input field')
})

function parseFullModel(fullModel: string): {
  provider: string
  modelName: string
} {
  const separatorIndex = fullModel.indexOf(':')
  if (separatorIndex < 0) {
    return { provider: '', modelName: fullModel }
  }

  return {
    provider: fullModel.slice(0, separatorIndex),
    modelName: fullModel.slice(separatorIndex + 1)
  }
}

function isOpenAIReasoningModel(provider: string, modelName: string): boolean {
  if (provider === 'openai' || provider === 'azure') {
    return modelName.startsWith('o')
  }

  return provider === 'openrouter' && modelName.startsWith('openai/o')
}

/**
 * Returns the appropriate question schema based on the full model name.
 * Uses the strict schema for OpenAI reasoning models starting with 'o'.
 */
export function getQuestionSchemaForModel(fullModel: string) {
  const { provider, modelName } = parseFullModel(fullModel)
  const useStrictSchema =
    Boolean(provider) &&
    Boolean(modelName) &&
    isOpenAIReasoningModel(provider, modelName)
  return useStrictSchema ? strictQuestionSchema : questionSchema
}
