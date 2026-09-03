import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.message.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.message.findUnique({ where: { id } });
  }

  create(dto: CreateMessageDto) {
    return this.prisma.message.create({ data: dto });
  }

  async markRead(id: string, read = true) {
    await this.ensure(id);
    return this.prisma.message.update({
      where: { id },
      data: { read },
    });
  }

  async remove(id: string) {
    await this.ensure(id);
    return this.prisma.message.delete({ where: { id } });
  }

  private async ensure(id: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');
  }
}
