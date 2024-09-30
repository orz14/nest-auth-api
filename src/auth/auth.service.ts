import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUserById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  generateToken(credentials: object, rememberMe: boolean = false): string {
    const payload = { data: credentials };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: rememberMe ? '7d' : '1d',
    });
  }

  generateRandomString(): string {
    const characters =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';

    for (let i = 0; i < 50; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    return randomString;
  }

  async generateRefreshToken(id: string): Promise<string> {
    const refreshToken = this.generateRandomString();
    await this.prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
    return refreshToken;
  }

  async validateRefreshToken(
    id: string,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user?.refreshToken === refreshToken;
  }

  async login(data: LoginDto): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new ForbiddenException('Invalid password');
    } else {
      const refreshToken = await this.generateRefreshToken(user.id);
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        refreshToken,
      };
      const token = this.generateToken(payload, data.rememberMe);
      return {
        data: payload,
        statusCode: 200,
        accessToken: token,
      };
    }
  }

  async refreshToken(user: {
    id: string;
    name: string;
    email: string;
  }): Promise<any> {
    const refreshToken = await this.generateRefreshToken(user.id);
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      refreshToken,
    };
    const newAccessToken = this.generateToken(payload);
    return {
      statusCode: 201,
      accessToken: newAccessToken,
    };
  }

  async logout(id: string): Promise<any> {
    await this.prisma.user.update({
      where: { id },
      data: { refreshToken: null },
    });
    return {
      status: true,
      statusCode: 200,
      message: 'Logout successful',
    };
  }
}
