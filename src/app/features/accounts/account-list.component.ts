import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../core/services/account.service';
import { CuentaFondo } from '../../core/models/finance.types';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Mis Cuentas</h1>
          <p class="mt-2 text-gray-500 font-medium">Gestiona tus bancos, tarjetas y efectivo en un solo lugar.</p>
        </div>
        <div>
          <a routerLink="/accounts/new" 
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Nueva Cuenta
          </a>
        </div>
      </div>

      <!-- Stats Grid (Simple Overview) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Saldo Total</span>
              <p class="text-3xl font-black text-gray-900 mt-1">{{ totalBalance | currency:'MXN':'symbol-narrow' }}</p>
          </div>
          <!-- More stats could go here -->
      </div>

      <!-- Accounts Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let account of accounts()" 
               class="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div class="p-6">
                  <div class="flex items-start justify-between">
                      <div class="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                          </svg>
                      </div>
                      <span class="px-3 py-1 bg-gray-50 text-gray-500 text-xs font-bold rounded-lg uppercase tracking-wider capitalize">
                          {{ account.tipo_cuenta }}
                      </span>
                  </div>
                  
                  <div class="mt-6">
                      <h3 class="text-lg font-bold text-gray-900">{{ account.nombre_cuenta }}</h3>
                      <p class="text-sm font-medium text-gray-400">{{ account.institucion || 'Institución no especificada' }}</p>
                  </div>

                  <div class="mt-8 flex items-end justify-between">
                      <div>
                          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Balance</span>
                          <p class="text-2xl font-black text-gray-900 mt-1">
                              {{ account.saldo_actual | currency:account.moneda:'symbol-narrow' }}
                          </p>
                      </div>
                      <button (click)="deleteAccount(account.id!)" 
                              class="p-2 text-gray-300 hover:text-red-600 transition-colors">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                      </button>
                  </div>
              </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="accounts().length === 0" 
               class="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
              <div class="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <svg class="h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-3.586a1 1 0 00-.707.293l-1.414 1.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 006.586 13H4"/>
                  </svg>
              </div>
              <h2 class="text-xl font-bold text-gray-900">No hay cuentas</h2>
              <p class="text-gray-500 max-w-xs mt-2">Empieza por agregar tu primera cuenta bancaria o efectivo.</p>
              <a routerLink="/accounts/new" class="mt-6 text-indigo-600 font-bold hover:text-indigo-700">Agregar mi primera cuenta &rarr;</a>
          </div>
      </div>
    </div>
    `
})
export class AccountListComponent implements OnInit {
  private accountService = inject(AccountService);

  accounts = signal<CuentaFondo[]>([]);
  totalBalance = 0;

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountService.getAccounts().subscribe({
      next: (data) => {
        this.accounts.set(data);
        this.calculateTotal();
      },
      error: (err) => console.error('Error loading accounts', err)
    });
  }

  calculateTotal() {
    this.totalBalance = this.accounts().reduce((sum, acc) => sum + Number(acc.saldo_actual), 0);
  }

  deleteAccount(id: string) {
    if (confirm('¿Estás seguro de eliminar esta cuenta?')) {
      this.accountService.deleteAccount(id).subscribe(() => {
        this.loadAccounts();
      });
    }
  }
}
