import { Controller, Get, Query } from '@nestjs/common';
import { LogsService } from './logs.service';

@Controller('agent/logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async getLogs(@Query('agentId') agentId: string) {
    return this.logsService.getLogs(agentId);
  }
}
