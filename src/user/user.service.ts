import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ulid } from 'ulid';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async users(): Promise<any> {
    const result = await this.prisma.user.findMany();
    return {
      status: true,
      statusCode: 200,
      data: result,
    };
  }

  async create(data: CreateUserDto): Promise<any> {
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
        id: ulid(),
        name,
        email,
        password: hashedPassword,
      },
    });

    return {
      status: true,
      statusCode: 201,
      data: result,
    };
  }

  async find(id: string): Promise<any> {
    const result = await this.prisma.user.findUnique({ where: { id } });
    if (!result) {
      throw new NotFoundException('User not found');
    }
    return {
      status: true,
      statusCode: 200,
      data: result,
    };
  }

  async update(id: string, data: UpdateUserDto): Promise<any> {
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
      statusCode: 200,
      data: result,
    };
  }

  async delete(id: string): Promise<any> {
    await this.find(id);
    await this.prisma.user.delete({ where: { id } });
    return {
      status: true,
      statusCode: 200,
      message: `User with id ${id} has been deleted`,
    };
  }
}
