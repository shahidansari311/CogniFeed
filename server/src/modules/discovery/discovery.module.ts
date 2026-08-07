import { Module } from '@nestjs/common';
import { DiscoveryProcessor } from './discovery.processor';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  providers: [DiscoveryProcessor],
})
export class DiscoveryModule {}
