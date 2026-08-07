import { Injectable } from '@nestjs/common';
import { AnthropicProvider } from './anthropic.provider';
import { GroqProvider } from './groq.provider';
import { LlmGenerationConfig, LlmProvider } from './llm.provider.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LlmService implements LlmProvider {
  private provider: LlmProvider;

  constructor(
    private configService: ConfigService,
    private anthropicProvider: AnthropicProvider,
    private groqProvider: GroqProvider
  ) {
    // Automatically use Groq if the API key is present
    if (this.configService.get<string>('GROQ_API_KEY')) {
      this.provider = this.groqProvider;
    } else {
      this.provider = this.anthropicProvider;
    }
  }

  generate(config: LlmGenerationConfig): Promise<string> {
    return this.provider.generate(config);
  }

  generateJson<T>(config: LlmGenerationConfig): Promise<T> {
    return this.provider.generateJson<T>(config);
  }
}
