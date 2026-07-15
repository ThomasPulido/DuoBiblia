create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  progress jsonb not null default '{}'::jsonb,
  premium_until timestamptz,
  streak_reward_claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_email_lower_idx on public.profiles (lower(email));

create table if not exists public.bold_payments (
  event_id text primary key,
  payment_id text not null,
  payer_email text not null,
  payment_reference text,
  amount numeric,
  currency text,
  payment_method text,
  status text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.app_versions (
  platform text primary key check (platform in ('android', 'ios', 'web')),
  latest_version text not null,
  minimum_version text not null,
  store_url text not null,
  title jsonb not null,
  message jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.bold_payments enable row level security;
alter table public.app_versions enable row level security;

create policy "users read own profile" on public.profiles
  for select using (auth.uid() = user_id);
create policy "users insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "anyone reads app versions" on public.app_versions
  for select using (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, display_name)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

revoke all on public.bold_payments from anon, authenticated;
revoke insert, update on public.profiles from anon, authenticated;
grant update (email, display_name, progress, updated_at) on public.profiles to authenticated;
revoke insert, update, delete on public.app_versions from anon, authenticated;

create or replace function public.grant_bold_premium(
  p_event_id text,
  p_payment_id text,
  p_payer_email text,
  p_payment_reference text,
  p_amount numeric,
  p_currency text,
  p_payment_method text,
  p_status text,
  p_payload jsonb
)
returns timestamptz
language plpgsql
security definer set search_path = public
as $$
declare
  target_user uuid;
  current_until timestamptz;
  granted_until timestamptz;
begin
  select user_id, premium_until into target_user, current_until
  from public.profiles where lower(email) = lower(p_payer_email);
  if target_user is null then
    raise exception 'No verified account matches the Bold payer email';
  end if;

  insert into public.bold_payments (
    event_id, payment_id, payer_email, payment_reference, amount,
    currency, payment_method, status, payload
  ) values (
    p_event_id, p_payment_id, lower(p_payer_email), p_payment_reference,
    p_amount, p_currency, p_payment_method, p_status, p_payload
  ) on conflict (event_id) do nothing;

  if not found then
    return current_until;
  end if;

  granted_until := (case when current_until > now() then current_until else now() end) + interval '1 month';
  update public.profiles
  set premium_until = granted_until, updated_at = now()
  where user_id = target_user;
  return granted_until;
end;
$$;

revoke all on function public.grant_bold_premium(text,text,text,text,numeric,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.grant_bold_premium(text,text,text,text,numeric,text,text,text,jsonb) to service_role;

create or replace function public.claim_streak_reward()
returns timestamptz
language plpgsql
security definer set search_path = public
as $$
declare
  profile_row public.profiles%rowtype;
  granted_until timestamptz;
begin
  select * into profile_row from public.profiles where user_id = auth.uid() for update;
  if profile_row.user_id is null then raise exception 'Account required'; end if;
  if coalesce((profile_row.progress->>'streak')::integer, 0) < 90 then raise exception 'Streak goal not reached'; end if;
  if profile_row.streak_reward_claimed_at is not null then return profile_row.premium_until; end if;

  granted_until := (case when profile_row.premium_until > now() then profile_row.premium_until else now() end) + interval '1 month';
  update public.profiles
  set premium_until = granted_until, streak_reward_claimed_at = now(), updated_at = now()
  where user_id = auth.uid();
  return granted_until;
end;
$$;

revoke all on function public.claim_streak_reward() from public, anon;
grant execute on function public.claim_streak_reward() to authenticated;

insert into public.app_versions (platform, latest_version, minimum_version, store_url, title, message)
values
  ('android', '1.1.0', '1.1.0', 'https://play.google.com/store/apps/details?id=com.duobiblia.app',
   '{"es":"Actualización necesaria","en":"Update required"}',
   '{"es":"Instala la versión más reciente para continuar.","en":"Install the latest version to continue."}'),
  ('ios', '1.1.0', '1.1.0', 'https://apps.apple.com/app/id0000000000',
   '{"es":"Actualización necesaria","en":"Update required"}',
   '{"es":"Instala la versión más reciente para continuar.","en":"Install the latest version to continue."}'),
  ('web', '1.1.0', '1.1.0', './',
   '{"es":"Actualización necesaria","en":"Update required"}',
   '{"es":"Recarga para instalar la versión más reciente.","en":"Reload to install the latest version."}')
on conflict (platform) do nothing;
