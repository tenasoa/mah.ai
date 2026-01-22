-- Create enum for payment status
create type payment_status as enum ('pending_trust', 'confirmed', 'rejected', 'expired');

-- Create payments table
create table public.payments (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference_code text not null,
  status payment_status not null default 'pending_trust',
  amount integer default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '1 hour'), -- Default 1h trust access
  
  constraint payments_pkey primary key (id),
  constraint reference_code_length check (char_length(reference_code) >= 5)
);

-- Enable RLS
alter table public.payments enable row level security;

-- Policies
-- User can view their own payments
create policy "Users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- User can create payments (Trust declaration)
create policy "Users can insert own payments"
  on public.payments for insert
  with check (auth.uid() = user_id);

-- Indexes
create index payments_user_id_idx on public.payments(user_id);
create index payments_reference_code_idx on public.payments(reference_code);
