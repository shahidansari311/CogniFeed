import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { LlmService } from '../llm/llm.service';

@Processor('editorial')
export class EditorialProcessor extends WorkerHost {
  private readonly logger = new Logger(EditorialProcessor.name);

  constructor(
    private llmService: LlmService,
    @InjectQueue('publish') private publishQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<{ agentId: string, candidates: any[] }>) {
    const { agentId, candidates } = job.data;
    this.logger.log(`Running editorial scoring for ${candidates.length} candidates on agent ${agentId}`);

    // TODO:
    // 1. Run deterministic pre-filters (age, duplicate URL)
    // 2. Call LLM to score (novelty, substance, credibility, relevance, timeliness)
    // 3. Reject those below threshold, log to RejectedCandidate DB
    // 4. Pass the best candidate to the publish queue to generate a draft

    // Mock passing to publish
    if (candidates.length > 0) {
      await this.publishQueue.add('draft', {
        agentId,
        candidate: candidates[0],
        scores: { novelty: 80, substance: 75, credibility: 90, relevance: 85, timeliness: 95 }
      });
    }
  }
}
