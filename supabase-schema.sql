-- VibeDraft.Dev Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Projects table: stores user projects with file tree as JSONB
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'Untitled Project',
  files jsonb not null default '[]'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for fast user project lookups
create index if not exists idx_projects_user_id on public.projects(user_id);

-- Row Level Security: users can only see/edit their own projects
alter table public.projects enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Users can view own projects" on public.projects;
drop policy if exists "Users can create own projects" on public.projects;
drop policy if exists "Users can update own projects" on public.projects;
drop policy if exists "Users can delete own projects" on public.projects;

create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can create own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Chat history table: persists conversations per user
create table if not exists public.chat_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  messages jsonb not null default '[]'::jsonb,
  model text default 'sonnet',
  conversation_id text,
  updated_at timestamptz default now() not null
);

create index if not exists idx_chat_history_user_id on public.chat_history(user_id);

alter table public.chat_history enable row level security;

drop policy if exists "Users can view own chats" on public.chat_history;
drop policy if exists "Users can create own chats" on public.chat_history;
drop policy if exists "Users can update own chats" on public.chat_history;
drop policy if exists "Users can delete own chats" on public.chat_history;

create policy "Users can view own chats"
  on public.chat_history for select
  using (auth.uid() = user_id);

create policy "Users can create own chats"
  on public.chat_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update own chats"
  on public.chat_history for update
  using (auth.uid() = user_id);

create policy "Users can delete own chats"
  on public.chat_history for delete
  using (auth.uid() = user_id);

-- User profiles table: for subscription tier, display name
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  tier text default 'free' check (tier in ('free', 'pro', 'team')),
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
