import { Controller, Get, Query } from '@nestjs/common';
import { LedgerService } from './ledger.service';

@Controller('agent/ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get()
  async getLedger(@Query('agentId') agentId: string) {
    return this.ledgerService.getLedger(agentId);
  }
}
