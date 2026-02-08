// Seed sample data into the database
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './app/users/user.entity';
import { Organization } from './app/organizations/organization.entity';
import { UserOrganization } from './app/user-organizations/user-organization.entity';
import { Task } from './app/tasks/task.entity';
import { Role } from './app/auth/role.enum';
import * as bcrypt from 'bcrypt';




const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'nx_demo',
  synchronize: true,
  entities: [User, Organization, UserOrganization, Task],
});

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const orgRepo = AppDataSource.getRepository(Organization);
  const uoRepo = AppDataSource.getRepository(UserOrganization);
  const taskRepo = AppDataSource.getRepository(Task);

  // Orgs
  const parentOrg = orgRepo.create({ name: 'Parent Org' });
  await orgRepo.save(parentOrg);

  const childOrg = orgRepo.create({
    name: 'Child Org',
    parent: parentOrg,
  });
  await orgRepo.save(childOrg);

  // Users
  const passwordHash = await bcrypt.hash('password123', 10);
  const alice = userRepo.create({
    name: 'Alice',
    email: 'alice@gmail.com',
    passwordHash,
  });
  await userRepo.save(alice);

  const bob = userRepo.create({
    name: 'Bob',
    email: 'bob@gmail.com',
    passwordHash,
  });
  await userRepo.save(bob);

  // Memberships
  await uoRepo.save([
    uoRepo.create({
      user: alice,
      organization: parentOrg,
      role: Role.OWNER,
    }),
    uoRepo.create({
      user: bob,
      organization: childOrg,
      role: Role.VIEWER,
    }),
  ]);

  // Create tasks
  const task1 = taskRepo.create({
    title: 'Sample Task 1',
    category: 'Work',
    organization: parentOrg, // must link to org
  });
  await taskRepo.save(task1);

  const task2 = taskRepo.create({
    title: 'Sample Task 2',
    category: 'Personal',
    organization: childOrg,
  });
  await taskRepo.save(task2);

  console.log('data inserted');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
