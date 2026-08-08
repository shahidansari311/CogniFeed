import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import { ConfigService } from '@nestjs/config';
import { LlmGenerationConfig, LlmProvider } from './llm.provider.interface';

@Injectable()
export class GroqProvider implements LlmProvider {
  private groq: Groq;
  private readonly logger = new Logger(GroqProvider.name);
  
  // Primary model and fallback for rate-limit scenarios
  private readonly PRIMARY_MODEL = 'llama-3.3-70b-versatile';
  private readonly FALLBACK_MODEL = 'llama-3.1-8b-instant';

  // Retry config
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY_MS = 2000;

  constructor(private configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY') || 'mock-key',
    });
  }

  /**
   * Wrapper that handles 429 rate-limit errors:
   * 1. Retries with exponential backoff on the current model
   * 2. Falls back to a smaller model if the primary keeps hitting limits
   */
  private async callWithRetry<T>(
    fn: (model: string) => Promise<T>,
  ): Promise<T> {
    let lastError: any;

    // First: try primary model with retries
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        return await fn(this.PRIMARY_MODEL);
      } catch (error: any) {
        lastError = error;
        if (this.isRateLimitError(error)) {
          const delay = this.BASE_DELAY_MS * Math.pow(2, attempt);
          this.logger.warn(
            `Rate limited on ${this.PRIMARY_MODEL} (attempt ${attempt + 1}/${this.MAX_RETRIES}). Retrying in ${delay}ms...`,
          );
          await this.sleep(delay);
        } else {
          throw error; // Non-rate-limit errors should fail immediately
        }
      }
    }

    // Second: fall back to smaller model
    this.logger.warn(
      `Primary model ${this.PRIMARY_MODEL} rate-limited after ${this.MAX_RETRIES} retries. Falling back to ${this.FALLBACK_MODEL}.`,
    );

    try {
      return await fn(this.FALLBACK_MODEL);
    } catch (fallbackError: any) {
      if (this.isRateLimitError(fallbackError)) {
        this.logger.error('Fallback model also rate-limited. All models exhausted.');
      }
      throw fallbackError;
    }
  }

  private isRateLimitError(error: any): boolean {
    // Groq SDK throws errors with status codes, or the message contains "429"
    return (
      error?.status === 429 ||
      error?.statusCode === 429 ||
      error?.error?.code === 'rate_limit_exceeded' ||
      String(error?.message || '').includes('429') ||
      String(error?.message || '').includes('rate_limit')
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async generate(config: LlmGenerationConfig): Promise<string> {
    return this.callWithRetry(async (model) => {
      this.logger.debug(`Generating with Groq model: ${model}`);

      const completion = await this.groq.chat.completions.create({
        model,
        max_tokens: config.maxTokens || 4000,
        temperature: config.temperature || 0.7,
        messages: [
          { role: 'system', content: config.systemPrompt },
          { role: 'user', content: config.userPrompt },
        ],
      });

      if (completion.choices[0]?.message?.content) {
        return completion.choices[0].message.content;
      }

      throw new Error('Unexpected response type from Groq');
    });
  }

  async generateJson<T>(config: LlmGenerationConfig): Promise<T> {
    return this.callWithRetry(async (model) => {
      // For JSON, Groq supports response_format: { type: 'json_object' }
      // But we still need to instruct it via system prompt
      const jsonSystemPrompt = `${config.systemPrompt}\n\nIMPORTANT: You must respond ONLY with a valid JSON object.`;

      const completion = await this.groq.chat.completions.create({
        model,
        max_tokens: config.maxTokens || 4000,
        temperature: config.temperature || 0.7,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: jsonSystemPrompt },
          { role: 'user', content: config.userPrompt },
        ],
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('Groq did not return valid JSON');
      }

      try {
        return JSON.parse(responseText.trim()) as T;
      } catch (error) {
        this.logger.error(`Failed to parse JSON response: ${responseText}`);
        throw new Error('LLM did not return valid JSON');
      }
    });
  }
}
