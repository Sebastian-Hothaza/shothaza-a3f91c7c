import { Controller, Get } from '@nestjs/common';
import { LogService } from './log.service';
import { Log } from './log.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@UseGuards(JwtAuthGuard, RbacGuard) // As per assignment spec, ALL endpoints must invlude token verification
@Controller('audit-log')
export class LogController {
  constructor(private readonly logsService: LogService) {}

  
  @Get()
  @Roles(Role.OWNER)
  async findAll(): Promise<Log[]> {
    return this.logsService.findAll();
  }
}
