// Seed sample data into the database
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './app/users/user.entity';
import { Organization } from './app/organizations/organization.entity';
import { UserOrganization } from './app/user-organizations/user-organization.entity';
import { Role } from './app/user-organizations/role.enum';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'nx_demo',
  synchronize: true,
  entities: [User, Organization, UserOrganization],
});

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const orgRepo = AppDataSource.getRepository(Organization);
  const uoRepo = AppDataSource.getRepository(UserOrganization);

  // Orgs
  const parentOrg = orgRepo.create({ name: 'Parent Org' });
  await orgRepo.save(parentOrg);

  const childOrg = orgRepo.create({
    name: 'Child Org',
    parent: parentOrg,
  });
  await orgRepo.save(childOrg);

  // Users
  const alice = userRepo.create({
    name: 'Alice',
    passwordHash: 'hashed-password',
  });
  await userRepo.save(alice);

  const bob = userRepo.create({
    name: 'Bob',
    passwordHash: 'hashed-password',
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

  console.log('data inserted');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
