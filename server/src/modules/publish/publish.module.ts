import { Module } from '@nestjs/common';
import { PublishProcessor } from './publish.processor';
import { PrismaModule } from '../../common/database/prisma.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [PrismaModule, LlmModule],
  providers: [PublishProcessor],
})
export class PublishModule {}
