import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async users(): Promise<object> {
    const result = await this.prisma.user.findMany();
    return {
      status: true,
      data: result,
    };
  }

  async create(data: CreateUserDto): Promise<object> {
    const { name, email, password } = data;
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    return {
      status: true,
      data: result,
    };
  }

  async find(id: number): Promise<object> {
    const result = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!result) {
      throw new NotFoundException('User not found');
    }
    return {
      status: true,
      data: result,
    };
  }

  async update(id: number, data: UpdateUserDto): Promise<object> {
    await this.find(id);
    const { name, email } = data;
    if (email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    const result = await this.prisma.user.update({
      where: { id },
      data: {
        name,
        email,
      },
    });
    return {
      status: true,
      data: result,
    };
  }

  async delete(id: number): Promise<object> {
    await this.find(id);
    await this.prisma.user.delete({ where: { id } });
    return {
      status: true,
      message: `User with id ${id} has been deleted`,
    };
  }
}
