import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://10.0.0.4:3001/api/auth';

  // Tracks login state across the app
  private loggedIn$ = new BehaviorSubject<boolean>(false);
  private initialized$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  login(email: string, password: string) {
    return this.http.post(`${this.API_URL}/login`, { email, password }, { withCredentials: true },)
      .pipe(tap(() => this.loggedIn$.next(true)),);
  }

  checkAuth() {
    return this.http.get(`${this.API_URL}/me`, { withCredentials: true },)
      .pipe(tap(() => this.loggedIn$.next(true)),
        catchError(() => {
          this.loggedIn$.next(false);
          return of(null);
        }),
        tap(() => this.initialized$.next(true)),
      );
  }

  setLoggedIn(value: boolean) {
    this.loggedIn$.next(value);
  }

  isLoggedIn() {
    return this.loggedIn$.asObservable();
  }

  isInitialized() {
    return this.initialized$.asObservable();
  }

  logout() {
    return this.http
      .post(`${this.API_URL}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.loggedIn$.next(false);
          this.router.navigate(['/login']);
        }),
      );
  }

}
