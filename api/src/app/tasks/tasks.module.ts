import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './task.entity';
import { UserOrganization } from '../user-organizations/user-organization.entity';
import { Organization } from '../organizations/organization.entity';
import { OrganizationService } from '../organizations/organization.service';
import { LogModule } from '../logs/log.module';


@Module({
  imports: [TypeOrmModule.forFeature([Task]), TypeOrmModule.forFeature([UserOrganization]), TypeOrmModule.forFeature([Organization]), LogModule], 
  
  providers: [TasksService, OrganizationService],
  controllers: [TasksController],
})
export class TasksModule { }
