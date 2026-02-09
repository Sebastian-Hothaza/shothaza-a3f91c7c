import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organization.module';
import { UserOrganizationModule } from './user-organizations/user-organization.module';
import { AuthModule } from './auth/auth.module';
import { LogModule } from './logs/log.module';

@Module({
  imports: [
    // Connect to PostgreSQL database using TypeORM
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'nx_demo',
      autoLoadEntities: true,
      synchronize: true, // dev only
    }),
    TasksModule,
    UsersModule,
    OrganizationsModule,
    UserOrganizationModule,
    AuthModule,
    LogModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
