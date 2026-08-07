import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async getLedger(agentId: string) {
    const claims = await this.prisma.claim.findMany({
      where: {
        agentId,
      },
      orderBy: {
        openedAt: 'desc',
      },
      include: {
        post: {
          select: {
            text: true,
            createdAt: true,
          }
        }
      }
    });

    return claims;
  }
}
