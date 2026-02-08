import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { In } from 'typeorm';
import { OrganizationService } from '../organizations/organization.service';
import { JwtUser } from '../auth/jwt-user.interface';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '../auth/role.enum';

// Helper to mock a TypeORM repository
const mockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let service: TasksService;
  let taskRepo: any;
  let orgRepo: any;
  let orgService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: 'TaskRepository', useFactory: mockRepository },
        { provide: 'OrganizationRepository', useFactory: mockRepository },
        { provide: OrganizationService, useValue: { getOrgAndDescendants: jest.fn() } },
      ],
    })
      // Override the injected repositories
      .overrideProvider('TaskRepository')
      .useValue(mockRepository())
      .overrideProvider('OrganizationRepository')
      .useValue(mockRepository())
      .compile();

    service = module.get<TasksService>(TasksService);
    taskRepo = module.get('TaskRepository');
    orgRepo = module.get('OrganizationRepository');
    orgService = module.get(OrganizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task if user has access', async () => {
      const user: JwtUser = { id: 1, memberships: [{ organizationId: 1, role: Role.ADMIN }] };
      const org = { id: 1, name: 'Org 1' };
      orgRepo.findOne.mockResolvedValue(org);
      orgService.getOrgAndDescendants.mockResolvedValue([1]);
      taskRepo.create.mockReturnValue({ title: 'Task', category: 'Work', organization: org });
      taskRepo.save.mockResolvedValue({ id: 1, title: 'Task', category: 'Work', organization: org });

      const result = await service.create('Task', 'Work', 1, user);
      expect(result).toEqual({ id: 1, title: 'Task', category: 'Work', organization: org });
      expect(taskRepo.create).toHaveBeenCalledWith({ title: 'Task', category: 'Work', organization: org });
      expect(taskRepo.save).toHaveBeenCalled();
    });

    it('should throw if user has no access', async () => {
      const user: JwtUser = { id: 1, memberships: [{ organizationId: 2, role: Role.ADMIN }] };
      const org = { id: 1, name: 'Org 1' };
      orgRepo.findOne.mockResolvedValue(org);
      orgService.getOrgAndDescendants.mockResolvedValue([2]);

      await expect(service.create('Task', 'Work', 1, user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return all tasks in accessible orgs', async () => {
      const user: JwtUser = { id: 1, memberships: [{ organizationId: 1, role: Role.VIEWER }] };
      const tasks = [{ id: 1, title: 'Task 1' }];
      orgService.getOrgAndDescendants.mockResolvedValue([1]);
      taskRepo.find.mockResolvedValue(tasks);

      const result = await service.findAll(user);
      expect(result).toEqual(tasks);
      expect(taskRepo.find).toHaveBeenCalledWith({ where: { organization: In([1]) } });
    });
  });

  describe('update', () => {
    it('should update a task if user has access', async () => {
      const user: JwtUser = { id: 1, memberships: [{ organizationId: 1, role: Role.ADMIN }] };
      orgService.getOrgAndDescendants.mockResolvedValue([1]);
      taskRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(1, { title: 'Updated' }, user);
      expect(result).toEqual({ affected: 1 });
      expect(taskRepo.update).toHaveBeenCalledWith(1, { title: 'Updated' });
    });

    it('should throw if user has no access', async () => {
      const user: JwtUser = { id: 1, memberships: [{ organizationId: 2, role: Role.ADMIN }] };
      orgService.getOrgAndDescendants.mockResolvedValue([2]);

      await expect(service.update(1, { title: 'Updated' }, user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      taskRepo.delete.mockResolvedValue({ affected: 1 });
      const result = await service.delete(1);
      expect(result).toEqual({ affected: 1 });
      expect(taskRepo.delete).toHaveBeenCalledWith(1);
    });
  });
});
