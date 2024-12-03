import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConnectionService {
  constructor(private prisma: PrismaService) {}

  async check(): Promise<any> {
    await this.prisma.$queryRaw`SELECT current_database() AS database_name`;
  }
}
