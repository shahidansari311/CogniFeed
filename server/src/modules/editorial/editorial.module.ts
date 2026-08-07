import { Module } from '@nestjs/common';
import { EditorialProcessor } from './editorial.processor';
import { QueueModule } from '../queue/queue.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [QueueModule, LlmModule],
  providers: [EditorialProcessor],
})
export class EditorialModule {}
