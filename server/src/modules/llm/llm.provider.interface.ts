export interface LlmGenerationConfig {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LlmProvider {
  generate(config: LlmGenerationConfig): Promise<string>;
  generateJson<T>(config: LlmGenerationConfig): Promise<T>;
}
