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
  const apple = await orgRepo.save(
    orgRepo.create({ name: 'Apple Inc.' }),
  );

  const marketing = await orgRepo.save(
    orgRepo.create({ name: 'Marketing', parent: apple }),
  );

  // Users
  // Users (Apple)
   const passwordHash = await bcrypt.hash('password123', 10);
  const alice = await userRepo.save(userRepo.create({
    name: 'Alice',
    email: 'alice@owner.com',
    passwordHash,
  }));

  const andrew = await userRepo.save(userRepo.create({
    name: 'Andrew',
    email: 'andrew@admin.com',
    passwordHash,
  }));

  const amy = await userRepo.save(userRepo.create({
    name: 'Amy',
    email: 'amy@viewer.com',
    passwordHash,
  }));

  // Users (Marketing)
  const mark = await userRepo.save(userRepo.create({
    name: 'Mark',
    email: 'mark@owner.com',
    passwordHash,
  }));

  const mary = await userRepo.save(userRepo.create({
    name: 'Mary',
    email: 'mary@admin.com',
    passwordHash,
  }));

  const michael = await userRepo.save(userRepo.create({
    name: 'Michael',
    email: 'michael@viewer.com',
    passwordHash,
  }));

  // Memberships
  await uoRepo.save([
    { user: alice, organization: apple, role: Role.OWNER },
    { user: andrew, organization: apple, role: Role.ADMIN },
    { user: amy, organization: apple, role: Role.VIEWER },

    { user: mark, organization: marketing, role: Role.OWNER },
    { user: mary, organization: marketing, role: Role.ADMIN },
    { user: michael, organization: marketing, role: Role.VIEWER },
  ]);

  // Categories
  const categories = [
    '2026 Q1',
    'Meeting Info',
    'Shareholder Tasks',
    'Internal Tasks',
    'Other',
  ];

  // Helper
  function createTasks(company: string, org: Organization) {
    return categories.flatMap((category, i) =>
      Array.from({ length: 2 }, (_, n) =>
        taskRepo.create({
          title: `${company} - ${category} Sample Task ${n + 1}`,
          category,
          organization: org,
        }),
      ),
    );
  }

  // Create tasks
  await taskRepo.save([
    ...createTasks('Apple Inc', apple),
    ...createTasks('Marketing', marketing),
  ]);

  console.log('data inserted');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
