import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'scheduler',
    }),
    BullModule.registerQueue({
      name: 'discovery',
    }),
    BullModule.registerQueue({
      name: 'editorial',
    }),
    BullModule.registerQueue({
      name: 'publish',
    }),
    BullModule.registerQueue({
      name: 'ledger-review',
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
