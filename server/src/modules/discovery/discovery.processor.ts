import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import Parser from 'rss-parser';
import { PrismaService } from '../../common/database/prisma.service';

@Processor('discovery')
export class DiscoveryProcessor extends WorkerHost {
  private readonly logger = new Logger(DiscoveryProcessor.name);

  constructor(
    @InjectQueue('editorial') private editorialQueue: Queue,
    private prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<{ agentId: string }>) {
    const { agentId } = job.data;
    this.logger.log(`Running discovery for agent ${agentId}`);
    
    await this.prisma.consoleLog.create({
      data: { agentId, level: 'info', message: 'Discovery Phase: Fetching latest RSS feeds (hnrss.org)...' }
    });

    const parser = new Parser({ timeout: 10000 }); // Add timeout to prevent hanging
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
        await this.prisma.consoleLog.create({
          data: { agentId, level: 'info', message: `Discovery Phase: Found ${candidates.length} candidates. Passing to Editorial.` }
        });
        this.logger.log(`Passed ${candidates.length} live candidates to editorial queue.`);
      } else {
        await this.prisma.consoleLog.create({
          data: { agentId, level: 'warn', message: 'Discovery Phase: Feed returned 0 articles.' }
        });
      }
    } catch (error: any) {
      this.logger.error(`Discovery failed: ${error.message}`);
      await this.prisma.consoleLog.create({
        data: { agentId, level: 'error', message: `Discovery Phase Failed: ${error.message}` }
      });
    }
  }
}
