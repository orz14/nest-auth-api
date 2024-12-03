import { Controller, Post, Res } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { Response } from 'express';

@Controller('connection')
export class ConnectionController {
  constructor(private connectionService: ConnectionService) {}

  @Post('/check')
  async checkConnection(@Res() res: Response): Promise<any> {
    try {
      await this.connectionService.check();

      return res.status(200).json({
        status: true,
        statusCode: 200,
      });
    } catch (err) {
      return res.status(err.status).json({
        status: false,
        statusCode: err.status,
        message: err.message,
      });
    }
  }
}
