import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import Parser from 'rss-parser';

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

    const parser = new Parser();
    try {
      const feed = await parser.parseURL('https://hnrss.org/newest?points=20'); // Live AI/Tech source
      
      const candidates = feed.items.slice(0, 3).map(item => ({
        title: item.title,
        snippet: item.contentSnippet || item.content || 'No content snippet available',
        url: item.link,
        sourceType: 'rss'
      }));

      if (candidates.length > 0) {
        await this.editorialQueue.add('score', {
          agentId,
          candidates
        });
        this.logger.log(`Passed ${candidates.length} live candidates to editorial queue.`);
      }
    } catch (error: any) {
      this.logger.error(`Discovery failed: ${error.message}`);
    }
  }
}
