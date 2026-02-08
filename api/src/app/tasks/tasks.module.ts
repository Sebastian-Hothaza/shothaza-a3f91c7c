import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './task.entity';
import { UserOrganization } from '../user-organizations/user-organization.entity';
import { Organization } from '../organizations/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), TypeOrmModule.forFeature([UserOrganization]), TypeOrmModule.forFeature([Organization])],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule { }
