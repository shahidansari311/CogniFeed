import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { AgentService } from './agent.service';
import { InitAgentDto } from './dto/agent.dto';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('init')
  @HttpCode(HttpStatus.OK) // Using 200 since it can be idempotent (return existing)
  async init(@Body() dto: InitAgentDto) {
    const agent = await this.agentService.initAgent(dto);
    return {
      agentId: agent.id,
      ...agent,
    };
  }

  @Get(':id')
  async getAgent(@Param('id') id: string) {
    return this.agentService.getAgent(id);
  }
}
