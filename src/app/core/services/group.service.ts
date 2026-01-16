import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Grupo } from '../models/finance.types';
import { from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class GroupService {
    private supabaseService = inject(SupabaseService);

    // Track the active group for the session
    activeGroup = signal<Grupo | null>(null);

    /**
     * Finds or creates a default 'Personal' group for the current user.
     */
    async ensureDefaultGroup(userId: string): Promise<Grupo> {
        // 1. Check if user already has a group
        const { data: existingGroups, error: fetchError } = await this.supabaseService.supabase
            .from('grupos')
            .select('*')
            .eq('lider_id', userId)
            .limit(1);

        if (fetchError) throw fetchError;

        if (existingGroups && existingGroups.length > 0) {
            this.activeGroup.set(existingGroups[0]);
            return existingGroups[0];
        }

        // 2. Create a default group if none exists
        const { data: newGroup, error: createError } = await this.supabaseService.supabase
            .from('grupos')
            .insert({
                nombre_grupo: 'Personal',
                lider_id: userId,
                moneda_base: 'MXN'
            })
            .select()
            .single();

        if (createError) throw createError;

        // 3. Add user as an 'admin' member of the group
        const { error: memberError } = await this.supabaseService.supabase
            .from('miembros_grupo')
            .insert({
                grupo_id: newGroup.id,
                usuario_id: userId,
                rol: 'admin'
            });

        if (memberError) console.error('Error adding member to new group:', memberError);

        this.activeGroup.set(newGroup);
        return newGroup;
    }

    getGroupsByUserId(userId: string): Observable<Grupo[]> {
        return from(
            this.supabaseService.supabase
                .from('grupos')
                .select('*, miembros_grupo!inner(usuario_id)')
                .eq('miembros_grupo.usuario_id', userId)
        ).pipe(
            map(response => response.data as Grupo[] || [])
        );
    }
}
