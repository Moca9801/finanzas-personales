import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { CuentaFondo, Transaccion } from '../../core/models/finance.types';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styles: []
})
export class DashboardComponent implements OnInit {
    private accountService = inject(AccountService);
    private transactionService = inject(TransactionService);

    totalBalance = signal(0);
    incomeMonth = signal(0);
    expenseMonth = signal(0);
    recentTransactions = signal<Transaccion[]>([]);

    ngOnInit() {
        this.loadDashboardData();
    }

    loadDashboardData() {
        forkJoin({
            accounts: this.accountService.getAccounts(),
            transactions: this.transactionService.getTransactions()
        }).subscribe({
            next: ({ accounts, transactions }) => {
                // Calculate Total Balance
                const total = accounts.reduce((sum, acc) => sum + (Number(acc.saldo_actual) || 0), 0);
                this.totalBalance.set(total);

                // Filter for current month
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const monthTransactions = transactions.filter(t => {
                    const date = new Date(t.fecha_transaccion);
                    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                });

                // Calculate Income/Expense
                const income = monthTransactions
                    .filter(t => t.tipo_transaccion === 'ingreso')
                    .reduce((sum, t) => sum + (Number(t.monto) || 0), 0);
                this.incomeMonth.set(income);

                const expense = monthTransactions
                    .filter(t => t.tipo_transaccion === 'egreso')
                    .reduce((sum, t) => sum + (Number(t.monto) || 0), 0);
                this.expenseMonth.set(expense);

                // Recent Transactions (top 5)
                this.recentTransactions.set(transactions.slice(0, 5));
            },
            error: (err) => console.error('Error loading dashboard data:', err)
        });
    }
}
