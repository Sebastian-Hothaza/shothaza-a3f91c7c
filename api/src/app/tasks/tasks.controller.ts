import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from './task-update.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';


@UseGuards(JwtAuthGuard, RbacGuard) // As per assignment spec, ALL endpoints must invlude token verification
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    // Only admins & owners can create tasks. Task's org MUST match users org OR in case where user is member of parent company, allow generate in child company
    @Post()
    @Roles(Role.ADMIN)
    create(@Body('title') title: string, @Body('category') category: string, @Body('organizationId') organizationId: number, @Req() req: Request & { user?: any }) {
        return this.tasksService.create(title, category, organizationId, req.user);
    }

    // List tasks, if in parent company, then list those in child company
    @Get()
    @Roles(Role.VIEWER) // Note about guard: Answers "Can this endpoint be called at all?" NOT data scoping or data shaping
    findAll(@Req() req: Request & { user?: any }) {
        return this.tasksService.findAll(req.user);
    }


    // Same as create
    @Put(':id')
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Req() req: Request & { user?: any }) {
        return this.tasksService.update(Number(id), updateTaskDto, req.user);
    }

    // Only owner can do this
    @Delete(':id')
    @Roles(Role.OWNER)
    delete(@Param('id') id: string, @Req() req: Request & { user?: any }) {
        return this.tasksService.delete(Number(id), req.user);
    }
}
