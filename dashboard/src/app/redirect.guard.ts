import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RedirectGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate() {
    return this.authService.isLoggedIn().pipe(
      take(1),
      map((loggedIn) => {
        this.router.navigate([loggedIn ? '/dashboard' : '/login']);
        return false; // block navigation, we manually redirect
      }),
    );
  }
}
