create table if not exists public.whatsapp_requests (
  id uuid primary key default gen_random_uuid(),
  number text not null,
  name text,
  message text not null,
  status text not null,
  response jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.whatsapp_requests enable row level security;

create policy "Allow insert for all" on public.whatsapp_requests
  for insert with check (true);

create policy "Allow select for all" on public.whatsapp_requests
  for select using (true); 