import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { AnthropicProvider } from './anthropic.provider';
import { GroqProvider } from './groq.provider';

@Module({
  providers: [LlmService, AnthropicProvider, GroqProvider],
  exports: [LlmService],
})
export class LlmModule {}
