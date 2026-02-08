import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            // TEMP: read from Authorization header, later replace with cookie read
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => req?.cookies?.access_token,
            ]),
            secretOrKey: process.env.JWT_SECRET || 'dev-secret',
        });
    }

    async validate(payload: any) {
        // Whatever you return here becomes req.user
        return {
            userId: payload.sub,
            email: payload.email,
        };
    }
}
