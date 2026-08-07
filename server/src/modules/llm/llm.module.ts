import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { AnthropicProvider } from './anthropic.provider';

@Module({
  providers: [LlmService, AnthropicProvider],
  exports: [LlmService],
})
export class LlmModule {}
