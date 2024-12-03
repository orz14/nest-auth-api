import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from './decorators/user.decorator';
import { LoginDto } from './dtos/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('/register')
  @HttpCode(201)
  async authRegister(@Body() data: CreateUserDto): Promise<any> {
    return await this.userService.create(data);
  }

  @Post('/login')
  async authLogin(@Body() data: LoginDto, @Res() res: Response): Promise<any> {
    try {
      const response = await this.authService.login(data);

      return res.status(200).json({
        status: true,
        statusCode: 200,
        data: response?.data,
        accessToken: response?.accessToken,
      });
    } catch (err) {
      return res.status(err.status).json({
        status: false,
        statusCode: err.status,
        message: err.message,
      });
    }
  }

  @UseGuards(AuthGuard('jwt'))
  // @Serialize(UserDto)
  @Get('/me')
  @HttpCode(200)
  currentUser(@User() user: object): any {
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/refresh-token')
  @HttpCode(201)
  async refreshToken(
    @User() user: { id: string; name: string; email: string },
  ): Promise<any> {
    return await this.authService.refreshToken(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  @HttpCode(200)
  async authLogout(@User() user: { id: string }): Promise<any> {
    return await this.authService.logout(user.id);
  }
}
