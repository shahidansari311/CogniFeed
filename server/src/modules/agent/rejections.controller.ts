import { Controller, Get, Query } from '@nestjs/common';
import { RejectionsService } from './rejections.service';

@Controller('agent/rejections')
export class RejectionsController {
  constructor(private readonly rejectionsService: RejectionsService) {}

  @Get()
  async getRejections(@Query('agentId') agentId: string) {
    return this.rejectionsService.getRejections(agentId);
  }
}
