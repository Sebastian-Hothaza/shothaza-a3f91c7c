import { Controller, Post, Body, Res, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express'
import { AuthService } from './auth.service'


// The controller needs to handle the HTTP request. Service only handles business logic
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(
        @Body() body: { email: string; password: string },
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = await this.authService.validateUser(body.email, body.password); // First service call to make sure user login credentials are accurate
        if (!user) throw new UnauthorizedException('Invalid credentials');
        const { accessToken } = this.authService.login(user);

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false, // true in prod
            maxAge: 60 * 60 * 1000,
        });

        return { success: true };
    }
}
