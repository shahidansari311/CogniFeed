import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectQueue('scheduler') private schedulerQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.logger.log('Scheduler Service Initialized');
    // On restart, we might want to verify all running agents have their repeatable jobs
  }

  async startAgentScheduler(agentId: string) {
    // Random jitter 45 to 90 minutes
    const intervalMs = Math.floor(Math.random() * (90 - 45 + 1) + 45) * 60 * 1000;
    
    await this.schedulerQueue.upsertJobScheduler(
      `scheduler-${agentId}`,
      {
        every: intervalMs,
      },
      {
        name: 'tick',
        data: { agentId },
      }
    );

    await this.prisma.schedulerState.update({
      where: { agentId },
      data: {
        status: 'running',
      }
    });

    this.logger.log(`Started scheduler for agent ${agentId} with interval ${intervalMs / 60000}m`);
  }

  async stopAgentScheduler(agentId: string) {
    await this.schedulerQueue.removeJobScheduler(`scheduler-${agentId}`);

    await this.prisma.schedulerState.update({
      where: { agentId },
      data: {
        status: 'stopped',
      }
    });

    this.logger.log(`Stopped scheduler for agent ${agentId}`);
  }
}
