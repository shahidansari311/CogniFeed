import { Module } from '@nestjs/common';
import { ConfigModule } from './common/config/config.module';
import { LoggerModule } from './common/logger/logger.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './common/database/prisma.module';
import { AgentModule } from './modules/agent/agent.module';
import { FeedModule } from './modules/feed/feed.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { QueueModule } from './modules/queue/queue.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { LlmModule } from './modules/llm/llm.module';
import { DiscoveryModule } from './modules/discovery/discovery.module';
import { EditorialModule } from './modules/editorial/editorial.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    PrismaModule,
    HealthModule,
    FeedModule,
    LedgerModule,
    QueueModule,
    SchedulerModule,
    LlmModule,
    DiscoveryModule,
    EditorialModule,
    AgentModule,
  ],
})
export class AppModule {}
