import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from './task-update.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../user-organizations/role.enum';

@UseGuards(JwtAuthGuard, RbacGuard) // As per assignment spec, ALL endpoints must invlude token verification
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    // Only admins & owners can create tasks. Task's org MUST match users org OR in case where user is member of parent company, allow generate in child company
    @Post()
    create(@Body('title') title: string, @Body('category') category: string, @Body('organizationId') organizationId: number) {
        return this.tasksService.create(title, category, organizationId);
    }

    // List tasks, if in parent company, then list those in child company
    @Roles(Role.ADMIN)
    @Get()
    findAll() {
        return this.tasksService.findAll();
    }


    // Same as create
    @Put(':id')
    update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.tasksService.update(Number(id), updateTaskDto);
    }

    // Only owner can do this
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.tasksService.delete(Number(id));
    }
}
