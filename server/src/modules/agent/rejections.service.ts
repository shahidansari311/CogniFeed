import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class RejectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRejections(agentId: string) {
    const rejections = await this.prisma.rejectedCandidate.findMany({
      where: {
        agentId,
      },
      orderBy: {
        consideredAt: 'desc',
      },
      take: 50,
    });
    return rejections;
  }
}
