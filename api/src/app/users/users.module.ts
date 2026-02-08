import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity'
import { UserOrganization } from '../user-organizations/user-organization.entity';

// Imports bring in other modules so that this module can use the providers they expose.
@Module({
    imports: [TypeOrmModule.forFeature([User, UserOrganization])],
})
export class UsersModule {}