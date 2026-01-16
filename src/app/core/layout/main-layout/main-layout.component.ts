import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './main-layout.component.html',
    styles: []
})
export class MainLayoutComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    // Signals usually accessed as properties
    user = this.authService.user;

    isSidebarOpen = false;

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    async logout() {
        await this.authService.signOut();
        this.router.navigate(['/login']);
    }
}
