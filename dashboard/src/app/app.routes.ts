import { Route } from '@angular/router';
import { LoginComponent } from './login.component';
import { DashboardComponent } from './dashboard.component';
import { AuthGuard } from './auth-guard';
import { RedirectGuard } from './redirect.guard';

export const appRoutes: Route[] = [
    {
        path: '',
        canActivate: [RedirectGuard],
        component: LoginComponent, // never rendered
    },

    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
];
