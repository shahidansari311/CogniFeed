import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { InitAgentDto } from './dto/agent.dto';
import { SchedulerService } from '../scheduler/scheduler.service';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulerService: SchedulerService,
  ) {}

  async initAgent(dto: InitAgentDto) {
    const personaId = dto.persona.id || dto.persona.name;

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
              message: `Voice contract compiled: ${dto.persona.voice.tone}`
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
}
