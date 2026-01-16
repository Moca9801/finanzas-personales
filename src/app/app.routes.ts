import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
    },
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () => import('./core/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
        children: [
            {
                path: '',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'accounts',
                loadComponent: () => import('./features/accounts/account-list.component').then(m => m.AccountListComponent)
            },
            {
                path: 'accounts/new',
                loadComponent: () => import('./features/accounts/account-form.component').then(m => m.AccountFormComponent)
            },
            {
                path: 'transactions',
                loadComponent: () => import('./features/transactions/transaction-list.component').then(m => m.TransactionListComponent)
            },
            {
                path: 'transactions/new',
                loadComponent: () => import('./features/transactions/transaction-form.component').then(m => m.TransactionFormComponent)
            }
        ]
    },
    { path: '**', redirectTo: '' }
];
