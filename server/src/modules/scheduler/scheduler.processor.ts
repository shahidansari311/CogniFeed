import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Processor('scheduler')
export class SchedulerProcessor extends WorkerHost {
  private readonly logger = new Logger(SchedulerProcessor.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('discovery') private discoveryQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<{ agentId: string }>) {
    const { agentId } = job.data;
    
    this.logger.log(`Processing scheduler tick for agent ${agentId}`);

    // Update state
    await this.prisma.schedulerState.update({
      where: { agentId },
      data: {
        totalTicks: { increment: 1 },
        // Approximation of next tick, actual logic would be tied to repeatable job definition
        nextTickAt: new Date(Date.now() + 60 * 60 * 1000), 
      }
    });

    await this.prisma.consoleLog.create({
      data: {
        agentId,
        level: 'info',
        message: `Scheduler tick triggered`,
      }
    });

    // Start discovery pipeline
    await this.discoveryQueue.add('discover', { agentId });
  }
}
