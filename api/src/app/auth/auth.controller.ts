import { Controller, Post, Body, Req, Res, UnauthorizedException, Get } from '@nestjs/common';
import type { Response } from 'express'
import { AuthService } from './auth.service'
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';


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
            secure: false, // needs to be false to allow over HTTP, in prod wil be true
            maxAge: 60 * 60 * 1000,
        });

        return { success: true };

    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    me(@Req() req: Request & { user?: any }) {
        return {
            id: req.user.id,
            email: req.user.email
        };
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token');
        return { success: true };
    }

}
