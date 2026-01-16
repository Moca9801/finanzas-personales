import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { GroupService } from './group.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private supabaseService = inject(SupabaseService);
    private groupService = inject(GroupService);
    private router = inject(Router);

    private _user = signal<User | null>(null);
    private _session = signal<Session | null>(null);

    public user = computed(() => this._user());
    public session = computed(() => this._session());

    constructor() {
        this.initAuth();
    }

    private async initAuth() {
        try {
            // Get initial session
            const { data, error } = await this.supabaseService.supabase.auth.getSession();

            if (error) {
                console.error('Error fetching initial session:', error.message);
                return;
            }

            if (data.session) {
                this._session.set(data.session);
                this._user.set(data.session.user);
                console.log('Session initialized successfully');

                // Ensure default group for the session
                await this.groupService.ensureDefaultGroup(data.session.user.id);
            }
        } catch (err) {
            console.error('Unexpected error during auth initialization:', err);
        }

        // Listen to changes
        this.supabaseService.supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, session: Session | null) => {
                this._session.set(session);
                this._user.set(session?.user ?? null);
                console.log('Auth state changed:', event);

                if (session?.user) {
                    await this.groupService.ensureDefaultGroup(session.user.id);
                }

                if (event === 'SIGNED_OUT') {
                    this.groupService.activeGroup.set(null);
                    this.router.navigate(['/login']);
                }
            }
        );
    }

    async signUp(email: string, password: string, fullName: string) {
        return this.supabaseService.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });
    }

    async signIn(email: string, password: string) {
        return this.supabaseService.supabase.auth.signInWithPassword({
            email,
            password
        });
    }

    async signOut() {
        return this.supabaseService.supabase.auth.signOut();
    }

    async resetPassword(email: string) {
        return this.supabaseService.supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
    }

    async updatePassword(newPassword: string) {
        return this.supabaseService.supabase.auth.updateUser({
            password: newPassword
        });
    }

    get isLoggedIn() {
        return !!this._user();
    }
}
