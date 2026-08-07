import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { RejectionsController } from './rejections.controller';
import { RejectionsService } from './rejections.service';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { SchedulerModule } from '../scheduler/scheduler.module';

import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [SchedulerModule, LlmModule],
  controllers: [RejectionsController, LogsController, AgentController],
  providers: [AgentService, RejectionsService, LogsService],
  exports: [AgentService],
})
export class AgentModule {}
