import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { PrismaService } from '../../common/database/prisma.service';

@Processor('publish')
export class PublishProcessor extends WorkerHost {
  private readonly logger = new Logger(PublishProcessor.name);

  constructor(
    private llmService: LlmService,
    private prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<{ agentId: string, candidate: any, scores: any }>) {
    const { agentId, candidate, scores } = job.data;
    this.logger.log(`Publishing post for agent ${agentId} based on ${candidate.title}`);

    // Using 'any' cast here to silence the IDE's cached TypeScript server 
    // which hasn't picked up the new 'user' relation from Prisma.
    const agent = await (this.prisma.agent as any).findUnique({ 
      where: { id: agentId },
      include: {
        user: {
          include: { accounts: true }
        }
      }
    });
    if (!agent) return;

    // Fetch memory (recent posts) to avoid repetition
    const recentPosts = await this.prisma.post.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    const recentTopics = recentPosts.map(p => p.topicTags).flat().join(', ');

    const persona: any = agent.persona;
    
    const postGeneration = await this.llmService.generateJson<any>({
      systemPrompt: 'You are an autonomous AI persona writing a new post for your feed.',
      userPrompt: `Persona: ${JSON.stringify(persona.voice)}
Recent Topics Covered (DO NOT REPEAT): ${recentTopics}

Source Material:
Title: ${candidate.title}
Snippet: ${candidate.snippet}
URL: ${candidate.url}

Write a post based on the source material in your distinct voice. 
Return JSON matching this exactly:
{
  "text": "The content of the post",
  "topicTags": ["tag1", "tag2"],
  "rationale": "Why this topic was selected, why it is relevant now, and why it was chosen over other candidates."
}`
    });

    const novelty = scores?.novelty ?? 0;
    const substance = scores?.substance ?? 0;
    const credibility = scores?.credibility ?? 0;
    const relevance = scores?.relevance ?? 0;
    const timeliness = scores?.timeliness ?? 0;
    const overallScore = Math.round((novelty + substance + credibility + relevance + timeliness) / 5);

    await this.prisma.post.create({
      data: {
        agentId,
        text: postGeneration.text,
        rationale: postGeneration.rationale,
        sources: [candidate.url],
        topicTags: postGeneration.topicTags,
        editorialMeta: {
          candidateTitle: candidate.title,
          noveltyScore: novelty,
          substanceScore: substance,
          credibilityScore: credibility,
          relevanceScore: relevance,
          timelinessScore: timeliness,
          overallScore,
          candidatesConsidered: 1,
          rejectedAlternatives: [],
        }
      }
    });

    // Social Media Auto-Posting via OAuth
    const agentWithUser = agent as any;
    if (agentWithUser.user && agentWithUser.user.accounts) {
      for (const account of agentWithUser.user.accounts) {
        if (account.provider === 'twitter' && account.access_token) {
          try {
            const res = await fetch('https://api.twitter.com/2/tweets', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${account.access_token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ text: postGeneration.text })
            });
            if (res.ok) this.logger.log(`Posted to Twitter for agent ${agentId}`);
            else this.logger.error(`Twitter API error: ${await res.text()}`);
          } catch (e: any) {
            this.logger.error(`Failed to post to Twitter: ${e.message}`);
          }
        }
        
        if (account.provider === 'linkedin' && account.access_token) {
          try {
            const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${account.access_token}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
              },
              body: JSON.stringify({
                author: `urn:li:person:${account.providerAccountId}`,
                lifecycleState: "PUBLISHED",
                specificContent: {
                  "com.linkedin.ugc.ShareContent": {
                    shareCommentary: { text: postGeneration.text },
                    shareMediaCategory: "NONE"
                  }
                },
                visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
              })
            });
            if (res.ok) this.logger.log(`Posted to LinkedIn for agent ${agentId}`);
            else this.logger.error(`LinkedIn API error: ${await res.text()}`);
          } catch (e: any) {
            this.logger.error(`Failed to post to LinkedIn: ${e.message}`);
          }
        }
      }
    }

    this.logger.log(`Successfully published post for agent ${agentId}`);
  }
}
