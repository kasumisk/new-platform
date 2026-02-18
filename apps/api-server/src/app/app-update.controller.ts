import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { AppVersionService } from '../admin/services/app-version.service';
import {
  CheckUpdateDto,
  CheckUpdateResponseDto,
} from '../admin/dto/app-version-management.dto';

@ApiTags('App 版本更新')
@Controller('v1/app/update')
export class AppUpdateController {
  constructor(private readonly appVersionService: AppVersionService) {}

  /**
   * 检查 App 更新
   * POST /api/v1/app/update/check
   *
   * 公开接口，客户端调用。不需要登录认证。
   */
  @Post('check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '检查 App 更新' })
  @SwaggerResponse({
    status: 200,
    description: '检查更新结果',
    type: CheckUpdateResponseDto,
  })
  async checkUpdate(@Body() checkDto: CheckUpdateDto) {
    const data = await this.appVersionService.checkUpdate(checkDto);
    return {
      code: 0,
      message: data.need_update ? 'success' : '已是最新版本',
      data: data.need_update ? data : null,
    };
  }
}
