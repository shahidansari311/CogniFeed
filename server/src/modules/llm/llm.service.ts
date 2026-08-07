import { Injectable } from '@nestjs/common';
import { AnthropicProvider } from './anthropic.provider';
import { LlmGenerationConfig, LlmProvider } from './llm.provider.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LlmService implements LlmProvider {
  private provider: LlmProvider;

  constructor(
    private configService: ConfigService,
    private anthropicProvider: AnthropicProvider
  ) {
    // In the future, this can be dynamic based on config
    this.provider = this.anthropicProvider;
  }

  generate(config: LlmGenerationConfig): Promise<string> {
    return this.provider.generate(config);
  }

  generateJson<T>(config: LlmGenerationConfig): Promise<T> {
    return this.provider.generateJson<T>(config);
  }
}
