import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './log.entity';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { OrganizationService } from '../organizations/organization.service';
import { Task } from '../tasks/task.entity';
import { Organization } from '../organizations/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Log]), TypeOrmModule.forFeature([Task]), TypeOrmModule.forFeature([Organization])],
  providers: [LogService, OrganizationService],
  controllers: [LogController],
  exports: [LogService], // export so other modules can inject LogsService
})
export class LogModule {}
