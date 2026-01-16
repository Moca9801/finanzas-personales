import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TransactionService } from '../../core/services/transaction.service';
import { AccountService } from '../../core/services/account.service';
import { CuentaFondo, Transaccion, SubtipoTransaccion } from '../../core/models/finance.types';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-2xl mx-auto py-12 px-4">
        <a routerLink="/transactions" class="inline-flex items-center text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors mb-8 group">
            <svg class="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Volver a transacciones
        </a>

        <div class="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
            <div class="p-8 md:p-12">
                <h1 class="text-3xl font-black text-gray-900 tracking-tight mb-10">Nuevo Movimiento</h1>

                <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()" class="space-y-8">
                    <!-- Type Selector -->
                    <div class="flex p-1 bg-gray-50 rounded-2xl">
                        <button type="button" (click)="setTipo('egreso')"
                            [class]="selectedTipo() === 'egreso' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-400'"
                            class="flex-1 py-3 px-4 rounded-xl font-bold transition-all">Gasto</button>
                        <button type="button" (click)="setTipo('ingreso')"
                            [class]="selectedTipo() === 'ingreso' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'"
                            class="flex-1 py-3 px-4 rounded-xl font-bold transition-all">Ingreso</button>
                        <button type="button" (click)="setTipo('transferencia')"
                            [class]="selectedTipo() === 'transferencia' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'"
                            class="flex-1 py-3 px-4 rounded-xl font-bold transition-all">Traspaso</button>
                    </div>

                    <!-- Account & Amount -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700 ml-1">Cuenta Origen</label>
                            <select formControlName="cuenta_origen_id" 
                                class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium transition-all appearance-none cursor-pointer">
                                <option *ngFor="let acc of accounts()" [value]="acc.id">
                                    {{ acc.nombre_cuenta }} ({{ acc.saldo_actual | currency:acc.moneda }})
                                </option>
                            </select>
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700 ml-1">Monto</label>
                            <div class="relative">
                                <span class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input type="number" formControlName="monto" 
                                    class="w-full pl-10 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-black text-xl transition-all"
                                    placeholder="0.00">
                            </div>
                        </div>
                    </div>

                    <!-- Category & Concept -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700 ml-1">Concepto</label>
                            <input type="text" formControlName="concepto" 
                                class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                                placeholder="Ej. Supermercado">
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700 ml-1">Fecha</label>
                            <input type="date" formControlName="fecha_transaccion" 
                                class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium transition-all">
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="pt-6">
                        <button type="submit" [disabled]="!transactionForm.valid || isLoading()" 
                            class="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
                            {{ isLoading() ? 'Guardando...' : 'Registrar Movimiento' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `
})
export class TransactionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private router = inject(Router);

  accounts = signal<CuentaFondo[]>([]);
  selectedTipo = signal<string>('egreso');
  isLoading = signal(false);

  transactionForm: FormGroup = this.fb.group({
    tipo_transaccion: ['egreso', Validators.required],
    subtipo_transaccion: ['egreso_externo', Validators.required],
    cuenta_origen_id: ['', Validators.required],
    monto: [null, [Validators.required, Validators.min(0.01)]],
    concepto: ['', Validators.required],
    fecha_transaccion: [new Date().toISOString().split('T')[0], Validators.required],
    moneda: ['MXN']
  });

  ngOnInit() {
    this.accountService.getAccounts().subscribe(accounts => {
      this.accounts.set(accounts);
      if (accounts.length > 0) {
        this.transactionForm.patchValue({ cuenta_origen_id: accounts[0].id });
        this.transactionForm.patchValue({ moneda: accounts[0].moneda });
      }
    });
  }

  setTipo(tipo: string) {
    this.selectedTipo.set(tipo);
    const subtipo: SubtipoTransaccion = tipo === 'ingreso' ? 'ingreso_externo' :
      tipo === 'transferencia' ? 'transferencia_interna' : 'egreso_externo';
    this.transactionForm.patchValue({
      tipo_transaccion: tipo,
      subtipo_transaccion: subtipo
    });
  }

  async onSubmit() {
    if (this.transactionForm.valid) {
      this.isLoading.set(true);
      const user = this.authService.user();

      if (user) {
        const transactionData: Omit<Transaccion, 'grupo_id'> = {
          ...this.transactionForm.value,
          usuario_capturo_id: user.id,
          usuario_responsable_id: user.id
        };

        this.transactionService.createTransaction(transactionData).subscribe({
          next: () => this.router.navigate(['/transactions']),
          error: (err) => {
            console.error(err);
            this.isLoading.set(false);
          }
        });
      }
    }
  }
}
