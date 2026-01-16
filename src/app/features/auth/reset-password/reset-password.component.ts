import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="flex flex-col items-center">
          <div class="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
            <span class="text-white text-3xl font-bold">ef</span>
          </div>
          <h2 class="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Nueva<span class="text-indigo-600">contraseña</span>
          </h2>
          <p class="mt-2 text-center text-sm text-gray-500">
            Ingresa tu nueva clave de acceso
          </p>
        </div>

        <form class="mt-8 space-y-6" [formGroup]="resetForm" (ngSubmit)="onSubmit()">
          <div class="rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <label for="password" class="sr-only">Nueva Contraseña</label>
            <input id="password" type="password" formControlName="password" required
              class="appearance-none relative block w-full px-4 py-3 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Nueva contraseña (min. 6 caracteres)">
          </div>

          <div *ngIf="errorMessage" class="text-red-500 text-sm text-center">
            {{ errorMessage }}
          </div>

          <div>
            <button type="submit" [disabled]="isLoading || resetForm.invalid"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg">
              <span *ngIf="!isLoading">Cambiar contraseña</span>
              <span *ngIf="isLoading">Actualizando...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    `
})
export class ResetPasswordComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    resetForm: FormGroup = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    isLoading = false;
    errorMessage = '';

    async onSubmit() {
        if (this.resetForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = '';

        try {
            const { error } = await this.authService.updatePassword(this.resetForm.value.password);
            if (error) throw error;
            alert('Contraseña actualizada con éxito');
            this.router.navigate(['/login']);
        } catch (err: any) {
            this.errorMessage = err.message || 'Error al actualizar la contraseña';
        } finally {
            this.isLoading = false;
        }
    }
}
