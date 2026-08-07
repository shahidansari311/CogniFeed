import { Module } from '@nestjs/common';
import { DiscoveryProcessor } from './discovery.processor';
import { QueueModule } from '../queue/queue.module';
import { PrismaModule } from '../../common/database/prisma.module';

@Module({
  imports: [QueueModule, PrismaModule],
  providers: [DiscoveryProcessor],
})
export class DiscoveryModule {}
