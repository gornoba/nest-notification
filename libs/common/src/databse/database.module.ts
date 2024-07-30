import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class DatabaseModule {
  static forRootAsync(entities: any = []) {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: async (
            configService: ConfigService,
          ): Promise<TypeOrmModuleOptions> => {
            const db = JSON.parse(configService.getOrThrow('DATABASE'));

            const config: TypeOrmModuleOptions = {
              type: 'postgres',
              host: db.host,
              port: db.port,
              username: db.username,
              password: db.password,
              database: db.database,
              schema: db.schema,
              entities: entities,
              autoLoadEntities: true,
              synchronize: true,
              logging: ['error'],
            };

            return config;
          },
          inject: [ConfigService],
        }),
      ],
    };
  }
}
