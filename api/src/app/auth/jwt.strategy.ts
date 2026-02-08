import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => req?.cookies?.access_token,
            ]),
            secretOrKey: process.env.JWT_SECRET || 'dev-secret',
        });
    }

    async validate(payload: { sub: number; email: string }) {
        const user = await this.usersRepo.findOne({
            where: { id: payload.sub },
            relations: {
                memberships: {
                    organization: true
                }
            },
        });

        if (!user) throw new UnauthorizedException('User no longer exists');

        return {
            id: user.id,
            email: user.email,
            memberships: user.memberships.map((m) => ({
                organizationId: m.organization.id,
                role: m.role,
            })),
        };
    }
}
