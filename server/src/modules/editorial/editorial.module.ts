import { Module } from '@nestjs/common';
import { EditorialProcessor } from './editorial.processor';
import { QueueModule } from '../queue/queue.module';
import { LlmModule } from '../llm/llm.module';
import { PrismaModule } from '../../common/database/prisma.module';

@Module({
  imports: [QueueModule, LlmModule, PrismaModule],
  providers: [EditorialProcessor],
})
export class EditorialModule {}
