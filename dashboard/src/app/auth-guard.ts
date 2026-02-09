import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth';
import { combineLatest } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  canActivate() {
    return combineLatest([
      this.authService.isInitialized(),
      this.authService.isLoggedIn(),
    ]).pipe(
      filter(([initialized]) => initialized),
      take(1),
      map(([_, loggedIn]) => {
        if (!loggedIn) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      }),
    );
  }
}

