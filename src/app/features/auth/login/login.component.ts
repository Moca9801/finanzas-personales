import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'] // Using CSS as per project setup
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        fullName: ['']
    });

    isLoading = false;
    errorMessage = '';
    isSignUp = false;

    async onSubmit() {
        if (this.loginForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = '';

        const { email, password, fullName } = this.loginForm.value;

        try {
            if (this.isSignUp) {
                const { data, error } = await this.authService.signUp(email, password, fullName || 'Usuario');
                if (error) throw error;

                // If user is automatically signed in or needs confirmation
                if (data.session) {
                    this.router.navigate(['/']);
                } else {
                    alert('¡Cuenta creada! Revisa tu email para confirmar tu cuenta y luego inicia sesión.');
                    this.isSignUp = false;
                    this.loginForm.patchValue({ password: '' });
                }
            } else {
                const { data, error } = await this.authService.signIn(email, password);
                if (error) throw error;

                if (data.session) {
                    this.router.navigate(['/']);
                }
            }
        } catch (err: any) {
            this.errorMessage = err.message || 'Error en la operación';
        } finally {
            this.isLoading = false;
        }
    }

    toggleMode() {
        this.isSignUp = !this.isSignUp;
        this.errorMessage = '';
    }
}
