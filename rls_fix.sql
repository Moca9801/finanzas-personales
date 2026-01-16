-- SUPABASE RLS FIX

-- Allow users to manage their own profile
drop policy if exists "Users can view own profile" on public.usuarios;
create policy "Users can view own profile" on public.usuarios for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.usuarios;
create policy "Users can update own profile" on public.usuarios for update using (auth.uid() = id);

-- Allow users to create their own 'Personal' group
drop policy if exists "Users can insert own group" on public.grupos;
create policy "Users can insert own group" on public.grupos 
    for insert with check (auth.uid() = lider_id);

drop policy if exists "Users can view own groups" on public.grupos;
create policy "Users can view own groups" on public.grupos 
    for select using (
        auth.uid() = lider_id or 
        id in (select grupo_id from public.miembros_grupo where usuario_id = auth.uid())
    );

-- Allow users to join groups
drop policy if exists "Users can insert own membership" on public.miembros_grupo;
create policy "Users can insert own membership" on public.miembros_grupo 
    for insert with check (auth.uid() = usuario_id);

drop policy if exists "Users can view memberships" on public.miembros_grupo;
create policy "Users can view memberships" on public.miembros_grupo 
    for select using (usuario_id = auth.uid());

-- Allow management of accounts
drop policy if exists "Users can insert accounts" on public.cuentas_fondos;
create policy "Users can insert accounts" on public.cuentas_fondos 
    for insert with check (
        grupo_id in (select id from public.grupos where lider_id = auth.uid()) or
        grupo_id in (select grupo_id from public.miembros_grupo where usuario_id = auth.uid())
    );

drop policy if exists "Users can view accounts" on public.cuentas_fondos;
create policy "Users can view accounts" on public.cuentas_fondos 
    for select using (
        grupo_id in (select id from public.grupos where lider_id = auth.uid()) or
        grupo_id in (select grupo_id from public.miembros_grupo where usuario_id = auth.uid())
    );

-- Allow management of transactions
drop policy if exists "Users can insert transactions" on public.transacciones;
create policy "Users can insert transactions" on public.transacciones 
    for insert with check (
        grupo_id in (select id from public.grupos where lider_id = auth.uid()) or
        grupo_id in (select grupo_id from public.miembros_grupo where usuario_id = auth.uid())
    );

drop policy if exists "Users can view transactions" on public.transacciones;
create policy "Users can view transactions" on public.transacciones 
    for select using (
        grupo_id in (select id from public.grupos where lider_id = auth.uid()) or
        grupo_id in (select grupo_id from public.miembros_grupo where usuario_id = auth.uid())
    );
