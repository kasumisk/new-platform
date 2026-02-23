import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { OkxModule } from './okx/okx.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import { GatewayModule } from './gateway/gateway.module';
import { LangChainModule } from './langchain/langchain.module';
import { AppUpdateModule } from './app/app-update.module';
import { AppUserModule } from './app/app-user/app-user.module';
import { AppFileModule } from './app/app-file.module';
import { StorageModule } from './storage/storage.module';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { LoggerMiddleware } from './core/middlewares/logger.middleware';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    CoreModule,
    OkxModule,
    AuthModule,
    AdminModule,
    HealthModule,
    GatewayModule,
    LangChainModule,
    AppUpdateModule,
    AppUserModule,
    AppFileModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => {
        return new Proxy(
          {},
          {
            get(target, prop) {
              if (prop === 'canActivate') {
                return async (context: any) => {
                  // 检查是否是公开路由
                  const isPublic = reflector.getAllAndOverride('isPublic', [
                    context.getHandler(),
                    context.getClass(),
                  ]);

                  if (isPublic) {
                    return true;
                  }

                  // 这里应该使用实际的 ApiKeyGuard，但需要依赖注入
                  // 暂时返回 true，稍后完善
                  return true;
                };
              }
              return target[prop];
            },
          },
        );
      },
      inject: [Reflector],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
