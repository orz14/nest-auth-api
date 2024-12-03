import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { ConnectionModule } from './connection/connection.module';
import { ConnectionController } from './connection/connection.controller';
import { ConnectionService } from './connection/connection.service';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, ConnectionModule],
  controllers: [
    AppController,
    UserController,
    AuthController,
    ConnectionController,
  ],
  providers: [
    AppService,
    PrismaService,
    UserService,
    AuthService,
    JwtService,
    ConnectionService,
  ],
})
export class AppModule {}
