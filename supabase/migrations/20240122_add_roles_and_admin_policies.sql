-- Add role column to profiles
alter table public.profiles 
add column if not exists role text not null default 'student' check (role in ('student', 'admin'));

-- Create index on role for performance
create index if not exists profiles_role_idx on public.profiles (role);

-- Policy for Admins to view all payments
create policy "Admins can view all payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Policy for Admins to update payments
create policy "Admins can update payments"
  on public.payments for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
