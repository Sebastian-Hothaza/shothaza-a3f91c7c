import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';


@Injectable()
export class AuthService {

    // Constructor: Nest, when you create AuthService, please give me a Repository<User> that is already wired to Postgres.
    // Equivalent to const User = mongoose.model('User');
    constructor(
        @InjectRepository(User)
        private usersRepo: Repository<User>,
    ) { }

    

    // Given a valid user, issues a JWT
    login(user: User) {
        console.log(`User ${user.name} has logged in`);
        // TODO: JWT
    }


    // Checks if credentials are valid
    async validateUser(email: string, password: string): Promise<User | null> {
        // Check user exists
        const user = await this.usersRepo.findOne({ where: { email } });
        if (!user) return null;
        // Check user has correct password
        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) return null;
        // Return the user
        return user;
    }

}