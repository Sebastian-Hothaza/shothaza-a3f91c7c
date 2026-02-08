import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from './task-update.dto';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    create(@Body('title') title: string, @Body('category') category: string) {
        return this.tasksService.create(title, category);
    }

    @Get()
    findAll() {
        return this.tasksService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tasksService.findOne(Number(id));
    }


    @Put(':id')
    update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.tasksService.update(Number(id), updateTaskDto);
    }



    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.tasksService.delete(Number(id));
    }
}
