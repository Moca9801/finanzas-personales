import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaccion } from '../../core/models/finance.types';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Movimientos</h1>
          <p class="mt-2 text-gray-500 font-medium">Historial completo de tus finanzas.</p>
        </div>
        <a routerLink="/transactions/new" 
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
          Registrar Movimiento
        </a>
      </div>

      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Concepto</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Cuenta</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Monto</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let t of transactions()" class="hover:bg-gray-50/50 transition-colors group">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                  {{ t.fecha_transaccion | date:'mediumDate' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">{{ t.concepto || 'Sin concepto' }}</div>
                  <div class="text-xs text-gray-400 font-medium capitalize">{{ t.subtipo_transaccion.replace('_', ' ') }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold italic">
                  {{ t.cuentas_fondos?.nombre_cuenta || '---' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-black"
                    [ngClass]="{'text-emerald-600': t.tipo_transaccion === 'ingreso', 'text-rose-600': t.tipo_transaccion === 'egreso', 'text-blue-600': t.tipo_transaccion === 'transferencia'}">
                    {{ t.tipo_transaccion === 'egreso' ? '-' : '+' }}{{ t.monto | currency:t.moneda:'symbol-narrow' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button (click)="deleteTransaction(t.id!)" class="text-gray-300 hover:text-red-600 transition-colors p-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr *ngIf="transactions().length === 0">
                <td colspan="5" class="px-6 py-20 text-center text-gray-400 font-bold">
                  No hay movimientos registrados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    `
})
export class TransactionListComponent implements OnInit {
  private transactionService = inject(TransactionService);
  transactions = signal<(Transaccion & { cuentas_fondos?: { nombre_cuenta: string } })[]>([]);

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactionService.getTransactions().subscribe({
      next: (data: any) => this.transactions.set(data),
      error: (err) => console.error(err)
    });
  }

  deleteTransaction(id: string) {
    if (confirm('¿Eliminar este movimiento?')) {
      this.transactionService.deleteTransaction(id).subscribe(() => this.loadTransactions());
    }
  }
}
