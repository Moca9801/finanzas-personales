import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../../core/services/account.service';
import { CuentaFondo } from '../../core/models/finance.types';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-xl mx-auto py-12 px-4">
        <!-- Back Button -->
        <a routerLink="/accounts" class="inline-flex items-center text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors mb-8 group">
            <svg class="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Volver a cuentas
        </a>

        <div class="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
            <div class="p-8 md:p-12">
                <div class="mb-10">
                    <h1 class="text-3xl font-black text-gray-900 tracking-tight">Nueva Cuenta</h1>
                    <p class="mt-2 text-gray-500 font-medium">Configura los detalles de tu nueva cuenta o fondo.</p>
                </div>

                <form [formGroup]="accountForm" (ngSubmit)="onSubmit()" class="space-y-8">
                    <!-- Name & Institution -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label for="nombre_cuenta" class="text-sm font-bold text-gray-700 ml-1">Nombre de la cuenta</label>
                            <input type="text" id="nombre_cuenta" formControlName="nombre_cuenta" 
                                class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                                placeholder="Ej. Nómina Bancomer">
                        </div>
                        <div class="space-y-2">
                            <label for="institucion" class="text-sm font-bold text-gray-700 ml-1">Institución (Opcional)</label>
                            <input type="text" id="institucion" formControlName="institucion" 
                                class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                                placeholder="Ej. BBVA">
                        </div>
                    </div>

                    <!-- Type & Currency -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label for="tipo_cuenta" class="text-sm font-bold text-gray-700 ml-1">Tipo de Cuenta</label>
                            <select id="tipo_cuenta" formControlName="tipo_cuenta" 
                                class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium transition-all appearance-none cursor-pointer">
                                <option value="debito">Débito</option>
                                <option value="credito">Crédito</option>
                                <option value="efectivo">Efectivo</option>
                                <option value="ahorro">Ahorro</option>
                                <option value="inversion">Inversión</option>
                            </select>
                        </div>
                        <div class="space-y-2">
                            <label for="moneda" class="text-sm font-bold text-gray-700 ml-1">Moneda</label>
                            <select id="moneda" formControlName="moneda" 
                                class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium transition-all appearance-none cursor-pointer">
                                <option value="MXN">Pesos (MXN)</option>
                                <option value="USD">Dólares (USD)</option>
                                <option value="EUR">Euros (EUR)</option>
                            </select>
                        </div>
                    </div>

                    <!-- Initial Balance -->
                    <div class="space-y-2">
                        <label for="saldo_inicial" class="text-sm font-bold text-gray-700 ml-1">Saldo Inicial / Saldo Actual</label>
                        <div class="relative">
                            <span class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                            <input type="number" id="saldo_inicial" formControlName="saldo_inicial" 
                                class="w-full pl-10 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-black text-xl transition-all"
                                placeholder="0.00">
                        </div>
                        <p class="text-xs text-gray-400 ml-1">Este será el punto de partida para tus transacciones.</p>
                    </div>

                    <!-- Error Message -->
                    <div *ngIf="errorMessage()" class="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {{ errorMessage() }}
                    </div>

                    <!-- Submit Button -->
                    <div class="pt-6">
                        <button type="submit" [disabled]="!accountForm.valid || isLoading()" 
                            class="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100">
                            <span *ngIf="!isLoading()">Crear Cuenta</span>
                            <span *ngIf="isLoading()">Guardando...</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `
})
export class AccountFormComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');

  accountForm: FormGroup = this.fb.group({
    nombre_cuenta: ['', [Validators.required, Validators.minLength(3)]],
    tipo_cuenta: ['debito', Validators.required],
    institucion: [''],
    moneda: ['MXN', Validators.required],
    saldo_inicial: [0, [Validators.required, Validators.min(0)]]
  });

  async onSubmit() {
    if (this.accountForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const formValue = this.accountForm.value;
      const accountData: Omit<CuentaFondo, 'grupo_id'> = {
        ...formValue,
        saldo_actual: formValue.saldo_inicial,
        activa: true
      };

      this.accountService.createAccount(accountData).subscribe({
        next: () => {
          this.router.navigate(['/accounts']);
        },
        error: (err) => {
          console.error('Error creating account:', err);
          this.errorMessage.set(err.message || 'Error al crear la cuenta. Inténtalo de nuevo.');
          this.isLoading.set(false);
        }
      });
    }
  }
}
