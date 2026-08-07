import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';

@Processor('discovery')
export class DiscoveryProcessor extends WorkerHost {
  private readonly logger = new Logger(DiscoveryProcessor.name);

  constructor(
    @InjectQueue('editorial') private editorialQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<{ agentId: string }>) {
    const { agentId } = job.data;
    this.logger.log(`Running discovery for agent ${agentId}`);

    // TODO: 
    // 1. Fetch RSS feeds
    // 2. Perform web search queries based on agent's stable interests
    // 3. Filter out candidates that aren't relevant
    // 4. Pass surviving candidates to editorial queue

    // Mock passing to editorial for now
    await this.editorialQueue.add('score', {
      agentId,
      candidates: [
        { title: 'Mock Candidate 1', snippet: '...', url: 'http://example.com/1', sourceType: 'rss' }
      ]
    });
  }
}
