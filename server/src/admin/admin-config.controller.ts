import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { ConfigEntity } from '../entities/config.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminOrModeratorGuard } from '../guards/admin-or-moderator.guard';

@Controller('admin/config')
export class AdminConfigController {
  constructor(private configService: ConfigService) {}

  @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
  @Get()
  async getConfig(): Promise<ConfigEntity> {
    return this.configService.config;
  }

  @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
  @Post('save')
  async saveConfig(@Body() body): Promise<any> {
    await this.configService.saveConfig(body.config);

    if (body.mailing) {
      // TODO: Отправить сообщение на фронт
    }

    return {
      success: true,
    };
  }
}
