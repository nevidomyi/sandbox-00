import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './database/config/database.config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseHealthIndicator, TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: ['.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.url'),
      }),
      inject: [ConfigService],
    }),
    TerminusModule,
    AuthModule,
    UsersModule,
  ],

  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly health: MongooseHealthIndicator) {}

  async onApplicationBootstrap() {
    const healthCheck = await this.health.pingCheck('database');
    console.log(healthCheck);
  }
}
