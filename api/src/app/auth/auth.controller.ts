import { UnauthorizedException } from '@nestjs/common';
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service'


// The controller needs to handle the HTTP request. Service only handles business logic
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        const user = await this.authService.validateUser(body.email, body.password); // First service call to make sure user login credentials are accurate
        if (!user) throw new UnauthorizedException('Invalid credentials');
        return this.authService.login(user); // Second service call to actually generate the JWT
    }
}
