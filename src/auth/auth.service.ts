import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { ulid } from 'ulid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUserById(id: number): Promise<User> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  generateToken(credentials: object, rememberMe: boolean = false): string {
    const payload = { data: credentials };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: rememberMe ? '1h' : '60s',
    });
  }

  async generateRefreshToken(id: number): Promise<string> {
    const refreshToken = ulid();
    await this.prisma.user.update({
      where: { id },
      data: { refresh_token: refreshToken },
    });
    return refreshToken;
  }

  async validateRefreshToken(
    id: number,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user?.refresh_token === refreshToken;
  }

  async login(data: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<object> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (isMatch) {
      const refreshToken = await this.generateRefreshToken(user.id);
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        refresh_token: refreshToken,
      };
      const token = this.generateToken(payload, data.rememberMe);
      return {
        data: payload,
        access_token: token,
      };
    } else {
      throw new ForbiddenException('Invalid password');
    }
  }

  async refreshToken(user: any): Promise<object> {
    const refreshToken = await this.generateRefreshToken(user.id);
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      refresh_token: refreshToken,
    };
    const newAccessToken = this.generateToken(payload);
    return { access_token: newAccessToken };
  }

  async logout(id: number): Promise<object> {
    await this.prisma.user.update({
      where: { id },
      data: { refresh_token: null },
    });
    return {
      status: true,
      message: 'Logout successful',
    };
  }
}
