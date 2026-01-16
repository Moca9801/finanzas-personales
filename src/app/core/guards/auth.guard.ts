import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // We might want to wait for auth initialization here, 
    // but for now we assume session is loaded or handled via observable if needed.
    // In a real app, we might check a "loading" signal or local storage token presence first.

    // Simple check
    if (authService.session()) {
        return true;
    }

    // If not logged in, redirect to login
    // Ideally, return UrlTree
    return router.parseUrl('/login');
};
