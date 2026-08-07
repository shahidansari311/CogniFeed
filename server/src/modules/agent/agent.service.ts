import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { InitAgentDto } from './dto/agent.dto';
import { SchedulerService } from '../scheduler/scheduler.service';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulerService: SchedulerService,
    private readonly llmService: LlmService,
  ) {}

  async initAgent(dto: InitAgentDto) {
    const personaId = dto.persona.id || dto.persona.name;

    if (!dto.persona.role || !dto.persona.voice || !dto.persona.stableInterests || !dto.persona.editorialStandards) {
      this.logger.log(`Sparse persona detected for ${dto.persona.name}. Expanding via LLM...`);
      const expansion = await this.llmService.generateJson<any>({
        systemPrompt: 'You are an expert AI persona designer.',
        userPrompt: `Design a complete autonomous AI persona for someone named "${dto.persona.name}" operating in the domain "${dto.persona.domain}".
Return JSON matching this schema exactly:
{
  "role": "Their specific job title/role",
  "stableInterests": ["interest 1", "interest 2", "interest 3"],
  "voice": {
    "tone": "description of their tone",
    "sentenceStyle": "description of sentence structure",
    "signatureMoves": ["quirk 1", "quirk 2"]
  },
  "editorialStandards": {
    "rejectIf": ["reject criterion 1", "reject criterion 2"],
    "preferIf": ["prefer criterion 1", "prefer criterion 2"]
  }
}`
      });
      dto.persona = { ...dto.persona, ...expansion };
    }

    // Check if an agent with this persona ID already exists to make it idempotent
    const existing = await this.prisma.agent.findFirst({
      where: {
        personaId: personaId
      },
      include: {
        schedulerState: true,
      }
    });

    if (existing) {
      this.logger.log(`Agent already initialized for persona ${dto.persona.name} (${existing.id})`);
      return existing;
    }

    // Create a new agent and its scheduler state
    const agent = await this.prisma.agent.create({
      data: {
        personaId,
        ...(dto.userId ? { user: { connect: { id: dto.userId } } } : {}),
        persona: JSON.parse(JSON.stringify(dto.persona)), // Store persona as JSON
        schedulerState: {
          create: {
            status: 'running',
            nextTickAt: new Date(), // Immediate tick
            totalTicks: 0,
          }
        },
        logs: {
          create: [
            {
              level: 'info',
              message: `Agent initialized: ${dto.persona.name} (${dto.persona.role})`
            },
            {
              level: 'info',
              message: `Voice contract compiled: ${dto.persona.voice?.tone || 'Default Tone'}`
            }
          ]
        }
      },
      include: {
        schedulerState: true,
      }
    });

    this.logger.log(`Initialized new agent ${agent.id} for persona ${dto.persona.name}`);
    
    await this.schedulerService.startAgentScheduler(agent.id);

    return agent;
  }

  async getAgent(id: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      include: {
        schedulerState: true,
      }
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    return agent;
  }

  async triggerAgentTick(id: string) {
    // Manually force a scheduler tick
    await this.schedulerService.triggerAgentScheduler(id);
    return { success: true, message: 'Tick triggered manually' };
  }
}
