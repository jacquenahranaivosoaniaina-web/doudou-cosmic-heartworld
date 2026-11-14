-- Roles (owner of the site manages photos, captions and voice notes)
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read their own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- The first account ever created becomes the site owner; later sign-ups get no rights.
create or replace function public.grant_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created_grant_admin
  after insert on auth.users for each row execute function public.grant_first_admin();

-- Photos, secret memories and voice recordings shown in the universe
create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('photo', 'secret', 'audio')),
  title text not null default '',
  caption text not null default '',
  url text,
  planet text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.media_items to anon;
grant select, insert, update, delete on public.media_items to authenticated;
grant all on public.media_items to service_role;
alter table public.media_items enable row level security;
create policy "Everyone can view the universe media" on public.media_items
  for select to anon, authenticated using (true);
create policy "Owner adds media" on public.media_items
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Owner edits media" on public.media_items
  for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Owner removes media" on public.media_items
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

insert into public.media_items (kind, title, caption, url, sort_order) values
  ('photo', 'Le mur fleuri', 'Mon plus beau hasard, c''est toi.', '/__l5e/assets-v1/' || 'PLACEHOLDER_1', 1);
delete from public.media_items;
