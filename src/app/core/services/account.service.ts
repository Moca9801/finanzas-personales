import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CuentaFondo } from '../models/finance.types';
import { Observable, from, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { GroupService } from './group.service';

@Injectable({
    providedIn: 'root'
})
export class AccountService {
    private supabaseService = inject(SupabaseService);
    private groupService = inject(GroupService);

    getAccounts(): Observable<CuentaFondo[]> {
        const activeGroup = this.groupService.activeGroup();
        if (!activeGroup) return throwError(() => new Error('No hay grupo activo seleccionado'));

        return from(
            this.supabaseService.supabase
                .from('cuentas_fondos')
                .select('*')
                .eq('grupo_id', activeGroup.id)
                .order('nombre_cuenta')
        ).pipe(
            map(response => response.data as CuentaFondo[] || [])
        );
    }

    getAccountById(id: string): Observable<CuentaFondo | null> {
        return from(
            this.supabaseService.supabase
                .from('cuentas_fondos')
                .select('*')
                .eq('id', id)
                .single()
        ).pipe(
            map(response => response.data as CuentaFondo)
        );
    }

    createAccount(account: Omit<CuentaFondo, 'grupo_id'>): Observable<CuentaFondo> {
        const activeGroup = this.groupService.activeGroup();
        if (!activeGroup) return throwError(() => new Error('No hay grupo activo para crear la cuenta'));

        const accountData = {
            ...account,
            grupo_id: activeGroup.id
        };

        return from(
            this.supabaseService.supabase
                .from('cuentas_fondos')
                .insert(accountData)
                .select()
                .single()
        ).pipe(
            map(response => response.data as CuentaFondo)
        );
    }

    updateAccount(id: string, account: Partial<CuentaFondo>): Observable<CuentaFondo> {
        return from(
            this.supabaseService.supabase
                .from('cuentas_fondos')
                .update(account)
                .eq('id', id)
                .select()
                .single()
        ).pipe(
            map(response => response.data as CuentaFondo)
        );
    }

    deleteAccount(id: string): Observable<void> {
        return from(
            this.supabaseService.supabase
                .from('cuentas_fondos')
                .delete()
                .eq('id', id)
        ).pipe(
            map(() => void 0)
        );
    }
}
