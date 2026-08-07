import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLogs(agentId: string) {
    const logs = await this.prisma.consoleLog.findMany({
      where: {
        agentId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100, // Limit terminal to last 100 entries
    });
    return logs;
  }
}
