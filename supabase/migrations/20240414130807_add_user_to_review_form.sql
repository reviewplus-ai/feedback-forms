-- Create companies table in public schema
create table public.companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text default '#4f46e5',
  custom_domain text,
  settings jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create review_forms table in public schema
create table public.review_forms (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) not null,
  user_id uuid references auth.users(id) not null,
  name text not null,
  slug text unique not null,
  welcome_message text default 'How would you rate your experience?',
  thank_you_message text default 'Thank you for your feedback!',
  rating_threshold integer default 4,
  positive_redirect_url text,
  negative_redirect_url text,
  enable_comments boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reviews table in public schema
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  form_id uuid references public.review_forms(id) not null,
  rating integer not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create company_users table in public schema
create table public.company_users (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) not null,
  user_id uuid references auth.users(id) not null,
  role text default 'member',
  unique(company_id, user_id)
);

-- Enable RLS
alter table public.companies enable row level security;
alter table public.review_forms enable row level security;
alter table public.reviews enable row level security;
alter table public.company_users enable row level security;

-- Create policies
create policy "Users can view their own companies"
  on public.companies for select
  using (id in (
    select company_id from public.company_users
    where user_id = auth.uid()
  ));

create policy "Users can view their own review forms"
  on public.review_forms for select
  using (user_id = auth.uid());

create policy "Users can create review forms"
  on public.review_forms for insert
  with check (user_id = auth.uid());

create policy "Users can update their own review forms"
  on public.review_forms for update
  using (user_id = auth.uid());

create policy "Anyone can view reviews"
  on public.reviews for select
  using (true);

create policy "Anyone can create reviews"
  on public.reviews for insert
  with check (true); 