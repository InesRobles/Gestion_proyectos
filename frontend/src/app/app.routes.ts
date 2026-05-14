import { Routes } from '@angular/router';
import { authGuard } from './guards/Auth.guard';
import { adminGuard } from './guards/Admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then(m => m.RegisterPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage),
    canActivate: [authGuard],
  },
  {
    path: 'home-admin',
    loadComponent: () => import('./home-admin/home-admin.page').then(m => m.HomeAdminPage),
    canActivate: [authGuard, adminGuard],
  },
];
