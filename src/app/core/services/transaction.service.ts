import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Transaccion } from '../models/finance.types';
import { Observable, from, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { GroupService } from './group.service';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    private supabaseService = inject(SupabaseService);
    private groupService = inject(GroupService);

    getTransactions(): Observable<Transaccion[]> {
        const activeGroup = this.groupService.activeGroup();
        if (!activeGroup) return throwError(() => new Error('No hay grupo activo seleccionado'));

        return from(
            this.supabaseService.supabase
                .from('transacciones')
                .select('*, cuentas_fondos!transacciones_cuenta_origen_id_fkey(nombre_cuenta)')
                .eq('grupo_id', activeGroup.id)
                .order('fecha_transaccion', { ascending: false })
                .order('hora_transaccion', { ascending: false })
        ).pipe(
            map(response => response.data as Transaccion[] || [])
        );
    }

    getRecentTransactions(limit: number = 5): Observable<Transaccion[]> {
        const activeGroup = this.groupService.activeGroup();
        if (!activeGroup) return throwError(() => new Error('No hay grupo activo seleccionado'));

        return from(
            this.supabaseService.supabase
                .from('transacciones')
                .select('*, cuentas_fondos!transacciones_cuenta_origen_id_fkey(nombre_cuenta)')
                .eq('grupo_id', activeGroup.id)
                .order('fecha_transaccion', { ascending: false })
                .order('hora_transaccion', { ascending: false })
                .limit(limit)
        ).pipe(
            map(response => response.data as Transaccion[] || [])
        );
    }

    createTransaction(transaction: Omit<Transaccion, 'grupo_id'>): Observable<Transaccion> {
        const activeGroup = this.groupService.activeGroup();
        if (!activeGroup) return throwError(() => new Error('No hay grupo activo para la transacción'));

        const transactionData = {
            ...transaction,
            grupo_id: activeGroup.id
        };

        return from(
            this.supabaseService.supabase
                .from('transacciones')
                .insert(transactionData)
                .select()
                .single()
        ).pipe(
            map(response => response.data as Transaccion)
        );
    }

    deleteTransaction(id: string): Observable<void> {
        return from(
            this.supabaseService.supabase
                .from('transacciones')
                .delete()
                .eq('id', id)
        ).pipe(
            map(() => void 0)
        );
    }
}
