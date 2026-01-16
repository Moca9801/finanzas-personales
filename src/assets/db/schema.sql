-- Create Accounts Table
create table accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text not null check (type in ('efectivo', 'banco', 'tarjeta_credito', 'inversion', 'otro')),
  balance numeric(12, 2) default 0.00,
  currency text default 'MXN',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Accounts
alter table accounts enable row level security;

create policy "Users can view their own accounts"
  on accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own accounts"
  on accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own accounts"
  on accounts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own accounts"
  on accounts for delete
  using (auth.uid() = user_id);

-- Create Transactions Table
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  account_id uuid references accounts(id) on delete cascade not null,
  type text not null check (type in ('ingreso', 'gasto', 'transferencia')),
  amount numeric(12, 2) not null,
  category text,
  description text,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Transactions
alter table transactions enable row level security;

create policy "Users can view their own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on transactions for delete
  using (auth.uid() = user_id);

-- Helper function to update account balance on transaction insert
create or replace function public.handle_new_transaction()
returns trigger as $$
begin
  if new.type = 'ingreso' then
    update accounts set balance = balance + new.amount where id = new.account_id;
  elsif new.type = 'gasto' then
    update accounts set balance = balance - new.amount where id = new.account_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new transaction
create trigger on_transaction_created
  after insert on transactions
  for each row execute procedure public.handle_new_transaction();
