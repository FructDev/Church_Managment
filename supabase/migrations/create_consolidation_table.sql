-- Create table for Consolidation Module (Kanban Board)
create table if not exists consolidation_prospects (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  phone text,
  address text,
  status text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'visita', 'doctrina', 'finalizado')),
  assigned_leader_id uuid references profiles(id) on delete set null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table consolidation_prospects enable row level security;

-- Policies (Allow authenticated users to read and write)
create policy "Allow read for authenticated users"
  on consolidation_prospects for select
  to authenticated
  using (true);

create policy "Allow insert for authenticated users"
  on consolidation_prospects for insert
  to authenticated
  with check (true);

create policy "Allow update for authenticated users"
  on consolidation_prospects for update
  to authenticated
  using (true);

create policy "Allow delete for authenticated users"
  on consolidation_prospects for delete
  to authenticated
  using (true);
