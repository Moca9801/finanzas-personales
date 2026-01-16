import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="flex flex-col items-center">
          <div class="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
            <span class="text-white text-3xl font-bold">ef</span>
          </div>
          <h2 class="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Recuperar<span class="text-indigo-600">acceso</span>
          </h2>
          <p class="mt-2 text-center text-sm text-gray-500">
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <form *ngIf="!emailSent" class="mt-8 space-y-6" [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
          <div class="rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <label for="email-address" class="sr-only">Email</label>
            <input id="email-address" type="email" formControlName="email" required
              class="appearance-none relative block w-full px-4 py-3 border-none placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Correo electrónico">
          </div>

          <div *ngIf="errorMessage" class="text-red-500 text-sm text-center">
            {{ errorMessage }}
          </div>

          <div>
            <button type="submit" [disabled]="isLoading || forgotForm.invalid"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg">
              <span *ngIf="!isLoading">Enviar enlace</span>
              <span *ngIf="isLoading">Procesando...</span>
            </button>
          </div>
        </form>

        <div *ngIf="emailSent" class="mt-8 text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div class="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-check"></i>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">¡Enviado!</h3>
          <p class="text-gray-500 text-sm mb-6">Revisa tu bandeja de entrada para continuar.</p>
          <button routerLink="/login" class="text-indigo-600 font-semibold hover:text-indigo-700">
            Volver al inicio de sesión
          </button>
        </div>

        <div *ngIf="!emailSent" class="text-center mt-6">
          <a routerLink="/login" class="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            Recordé mi contraseña
          </a>
        </div>
      </div>
    </div>
    `
})
export class ForgotPasswordComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);

    forgotForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    isLoading = false;
    errorMessage = '';
    emailSent = false;

    async onSubmit() {
        if (this.forgotForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = '';

        try {
            const { error } = await this.authService.resetPassword(this.forgotForm.value.email);
            if (error) throw error;
            this.emailSent = true;
        } catch (err: any) {
            this.errorMessage = err.message || 'Error al enviar el correo';
        } finally {
            this.isLoading = false;
        }
    }
}
