import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { LlmService } from '../llm/llm.service';
import { PrismaService } from '../../common/database/prisma.service';

@Processor('editorial')
export class EditorialProcessor extends WorkerHost {
  private readonly logger = new Logger(EditorialProcessor.name);

  constructor(
    private llmService: LlmService,
    private prisma: PrismaService,
    @InjectQueue('publish') private publishQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<{ agentId: string, candidates: any[] }>) {
    const { agentId, candidates } = job.data;
    if (!candidates || candidates.length === 0) return;
    this.logger.log(`Running editorial scoring for ${candidates.length} candidates on agent ${agentId}`);

    const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) return;

    const persona: any = agent.persona;
    const standards = JSON.stringify(persona.editorialStandards);

    await this.prisma.consoleLog.create({
      data: { agentId, level: 'info', message: `Editorial Phase: Evaluating ${candidates.length} candidates against persona standards...` }
    });

    try {
      const evaluation = await this.llmService.generateJson<any>({
        systemPrompt: 'You are a strict editorial judge for an AI/Tech persona. Evaluate the given candidates.',
        userPrompt: `Persona Standards: ${standards}\n\nCandidates: ${JSON.stringify(candidates)}\n\nEvaluate each candidate. Return a JSON object with:
{
  "evaluations": [
    { "index": 0, "approved": true/false, "reason": "why", "scores": { "novelty": 0-100, "substance": 0-100, "credibility": 0-100, "relevance": 0-100, "timeliness": 0-100 } }
  ],
  "bestCandidateIndex": <index of best approved candidate, or null if none approved>
}`
      });

    for (const evalResult of evaluation.evaluations) {
      const candidate = candidates[evalResult.index];
      if (!candidate) continue;

      if (!evalResult.approved || evalResult.index !== evaluation.bestCandidateIndex) {
        await this.prisma.rejectedCandidate.create({
          data: {
            agentId,
            title: candidate.title.substring(0, 255),
            snippet: candidate.snippet.substring(0, 1000),
            url: candidate.url,
            sourceType: candidate.sourceType,
            reason: evalResult.reason,
            scores: evalResult.scores
          }
        });
      }
    }

    if (evaluation.bestCandidateIndex !== null && evaluation.bestCandidateIndex !== undefined) {
      const best = candidates[evaluation.bestCandidateIndex];
      const bestEval = evaluation.evaluations.find((e: any) => e.index === evaluation.bestCandidateIndex);
      if (best && bestEval) {
        await this.publishQueue.add('draft', {
          agentId,
          candidate: best,
          scores: bestEval.scores
        });
        await this.prisma.consoleLog.create({
          data: { agentId, level: 'info', message: `Editorial Phase: Approved candidate "${best.title}" for publishing.` }
        });
        this.logger.log(`Approved candidate ${best.title} for publishing.`);
      }
    } else {
      await this.prisma.consoleLog.create({
        data: { agentId, level: 'warn', message: `Editorial Phase: All candidates rejected. Waiting for next tick.` }
      });
    }

    } catch (error: any) {
      this.logger.error(`Editorial failed: ${error.message}`);
      await this.prisma.consoleLog.create({
        data: { agentId, level: 'error', message: `Editorial Phase Failed: ${error.message}` }
      });
    }
  }
}
