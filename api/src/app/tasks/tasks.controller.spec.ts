import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { UpdateTaskDto } from './task-update.dto';


describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTasksService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockTasksService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RbacGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  describe('findAll', () => {
    it('should call service.findAll with the user', async () => {
      const user = { id: 1, memberships: [] };
      const req: any = { user };
      const mockTasks = [
        { id: 1, title: 'Task 1', category: 'Work', completed: false, organization: { id: 1, name: 'Org 1', children: [], tasks: [] } },
      ];

      mockTasksService.findAll.mockResolvedValue(mockTasks);

      const result = await controller.findAll(req);
      expect(result).toBe(mockTasks);
      expect(mockTasksService.findAll).toHaveBeenCalledWith(user);
    });
  });

  describe('create', () => {
    it('should call service.create with correct arguments', async () => {
      const user = { id: 1, memberships: [] };
      const req: any = { user };
      const dto = { title: 'New Task', category: 'Work', organizationId: 1 };
      const createdTask = { id: 1, ...dto, completed: false, organization: { id: 1, name: 'Org 1', children: [], tasks: [] } };

      mockTasksService.create.mockResolvedValue(createdTask);

      const result = await controller.create(dto.title, dto.category, dto.organizationId, req);
      expect(result).toBe(createdTask);
      expect(mockTasksService.create).toHaveBeenCalledWith(dto.title, dto.category, dto.organizationId, user);
    });
  });

  describe('update', () => {
    it('should call service.update with correct arguments', async () => {
      const user = { id: 1, memberships: [] };
      const req: any = { user };
      const dto: UpdateTaskDto = { title: 'Updated Task', category: 'Personal' };
      const updatedTask = { id: 1, ...dto, completed: false, organization: { id: 1, name: 'Org 1', children: [], tasks: [] } };

      mockTasksService.update.mockResolvedValue(updatedTask);

      const result = await controller.update('1', dto, req);
      expect(result).toBe(updatedTask);
      expect(mockTasksService.update).toHaveBeenCalledWith(1, dto, user);
    });
  });

  describe('delete', () => {
    it('should call service.delete with correct id', async () => {
      const user = { id: 1, memberships: [] };
      const req: any = { user };

      mockTasksService.delete.mockResolvedValue({ affected: 1 });
      const result = await controller.delete('1', req);
      expect(result).toEqual({ affected: 1 });
      expect(mockTasksService.delete).toHaveBeenCalledWith(1, user);
    });
  });

});
