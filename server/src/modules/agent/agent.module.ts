import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { RejectionsController } from './rejections.controller';
import { RejectionsService } from './rejections.service';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { SchedulerModule } from '../scheduler/scheduler.module';

@Module({
  imports: [SchedulerModule],
  controllers: [AgentController, RejectionsController, LogsController],
  providers: [AgentService, RejectionsService, LogsService],
  exports: [AgentService],
})
export class AgentModule {}
