import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(agentId: string, limit: number = 20, cursor?: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        agentId,
      },
      take: limit + 1, // Fetch one extra to determine if there's a next page
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        claims: true,
      },
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (posts.length > limit) {
      const nextItem = posts.pop(); // Remove the extra item
      nextCursor = nextItem!.id;
    }

    return {
      posts,
      nextCursor,
    };
  }
}
