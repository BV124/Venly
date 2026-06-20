-- ============================================================
-- VENLY DATABASE SETUP — v2
-- Copy everything below and paste into Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste → Run
--
-- This version replaces the original schema to match what the
-- site actually saves now (host email vs enquiry email, plan
-- caps, photos/features/event types as arrays, admin Filters
-- and Blog data, etc). If you already ran the old version of
-- this file on a live project, see the MIGRATION NOTE near the
-- bottom before running this — it includes safe "add column if
-- it doesn't exist" statements instead of dropping anything.
-- ============================================================

-- ============================================================
-- PROFILES (extends Supabase auth.users automatically)
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  avatar_url text,
  role text default 'user',
  created_at timestamp with time zone default now(),
  primary key (id)
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Auto-create profile when someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- VENUES
-- Matches the venue object shape used throughout the site
-- (admin venue editor, host dashboard wizard, public venue page).
-- ============================================================
create table public.venues (
  id uuid default gen_random_uuid() primary key,

  -- Who owns/manages this venue. user_id is the real link (an
  -- actual Supabase auth user) — host_email is kept too since
  -- it's how the admin looks a host up by email before they've
  -- necessarily signed up yet.
  user_id uuid references public.profiles(id) on delete set null,
  host_email text,
  host_name text,
  host_phone text,

  -- Where booking enquiries for this venue should go. If blank,
  -- the app falls back to host_email — effective_enquiry_email
  -- is pre-resolved at save time so anything sending an enquiry
  -- can just read this one column.
  enquiry_email text,
  effective_enquiry_email text,

  -- Core listing details
  name text not null,
  description text,
  type text,                -- 'Event space' | 'Meeting space' | 'Shoot Location'
  region text,
  district text,
  address text,
  capacity text,             -- free text, e.g. "20–150"
  price_from numeric,
  price_to numeric,
  website text,

  -- Plan & visibility
  plan text default 'Basic',           -- 'Basic' | 'Standard' | 'Premium'
  is_live boolean default false,
  subscription_status text default 'none', -- 'none' | 'active' | 'cancelled' | 'overridden'
  created_by text default 'host',      -- 'host' | 'admin' — who originally created this record

  -- Media & tags. photos[0] is always the chosen cover image —
  -- there's no separate cover-photo column, the admin and host
  -- editors both reorder this array so the cover is always first.
  photos text[] default '{}',
  features text[] default '{}',
  event_types text[] default '{}',

  page_hits integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table public.venues enable row level security;
create policy "Anyone can view live venues" on public.venues for select using (is_live = true);
create policy "Users can manage own venues" on public.venues for all using (auth.uid() = user_id);
create policy "Admins can manage all venues" on public.venues for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Keeps updated_at current on every edit
create or replace function public.handle_venue_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_venue_updated
  before update on public.venues
  for each row execute procedure public.handle_venue_updated_at();

-- ============================================================
-- FAVOURITES
-- ============================================================
create table public.favourites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  venue_id uuid references public.venues(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, venue_id)
);
alter table public.favourites enable row level security;
create policy "Users can manage own favourites" on public.favourites for all using (auth.uid() = user_id);

-- ============================================================
-- ENQUIRIES
-- Submitted from the public venue page's enquiry form.
-- ============================================================
create table public.enquiries (
  id uuid default gen_random_uuid() primary key,
  venue_id uuid references public.venues(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  message text,
  status text default 'open',
  created_at timestamp with time zone default now()
);
alter table public.enquiries enable row level security;
create policy "Venue owners can view enquiries" on public.enquiries for select using (
  exists (select 1 from public.venues where id = venue_id and user_id = auth.uid())
);
create policy "Anyone can submit enquiries" on public.enquiries for insert with check (true);
create policy "Admins can view all enquiries" on public.enquiries for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- SUBSCRIPTIONS
-- One row per active/past Stripe subscription. Note: Stripe
-- checkout itself isn't wired up in the app yet — this table is
-- ready for whenever that gets built, it's not populated by
-- anything today.
-- ============================================================
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  venue_id uuid references public.venues(id) on delete cascade,
  plan text not null,
  stripe_subscription_id text,
  stripe_customer_id text,
  status text default 'active',
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now()
);
alter table public.subscriptions enable row level security;
create policy "Users can view own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Admins can view all subscriptions" on public.subscriptions for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- BLOG POSTS
-- Matches the admin blog editor's block-based content structure.
-- "blocks" is a JSON array of {type, text} or {type, items}
-- objects (paragraph / heading / quote / list) — kept as JSONB
-- rather than a separate table since the block shape varies by
-- type and is only ever read/written as a whole array.
-- ============================================================
create table public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text,
  excerpt text,
  img text,
  read_time text default '4 min read',
  published boolean default false,
  featured boolean default false,        -- shown in the homepage "From the Blog" section
  views integer default 0,
  blocks jsonb default '[]'::jsonb,
  author_id uuid references public.profiles(id) on delete set null,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table public.blog_posts enable row level security;
create policy "Anyone can view published posts" on public.blog_posts for select using (published = true);
create policy "Admins can manage all posts" on public.blog_posts for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create trigger on_blog_post_updated
  before update on public.blog_posts
  for each row execute procedure public.handle_venue_updated_at();

-- ============================================================
-- PLATFORM FILTERS
-- Single-row JSONB store for everything managed on the admin's
-- Filters page — regions, districts per region, amenities/
-- features, event types per space type, blog categories. Kept
-- as one JSONB blob (rather than normalized tables) because this
-- data is read as a whole object everywhere it's used (homepage
-- search, venue editors, Find a Space) and changes infrequently —
-- normalizing it into many small tables would add complexity
-- without real benefit here.
-- ============================================================
create table public.platform_filters (
  id integer primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default now(),
  constraint single_row check (id = 1)
);
alter table public.platform_filters enable row level security;
create policy "Anyone can view filters" on public.platform_filters for select using (true);
create policy "Admins can manage filters" on public.platform_filters for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create trigger on_filters_updated
  before update on public.platform_filters
  for each row execute procedure public.handle_venue_updated_at();

-- Seed the single filters row with the same defaults the app
-- currently falls back to (VENLY_DEFAULT_FILTERS in venly-config.js)
insert into public.platform_filters (id, data) values (1, '{
  "regions": ["Auckland", "Wellington", "Christchurch", "Hamilton", "Bay of Plenty"],
  "districtsByRegion": {
    "Auckland": ["Auckland City", "North Shore", "Waitakere", "Manukau", "Papakura"],
    "Wellington": ["Wellington City", "Lower Hutt", "Upper Hutt", "Porirua"],
    "Christchurch": ["Christchurch Central", "Riccarton", "Sydenham"],
    "Hamilton": ["Hamilton Central", "Chartwell", "Rototuna"],
    "Bay of Plenty": ["Tauranga", "Mount Maunganui", "Rotorua", "Whakatane"]
  },
  "amenities": ["WiFi", "Parking", "AV Equipment", "Catering", "Wheelchair Access", "Outdoor Space"],
  "eventsByType": {
    "event": ["Wedding", "18th Party", "21st Party", "Corporate Event", "Private Party", "Product Launch", "Gala / Awards", "Market / Expo", "Live Performance"],
    "meeting": ["Boardroom", "Workshop", "Training", "Conference", "Interview Room", "Coworking"],
    "shoot": ["Film & TV", "Photography", "Commercial", "Content Creation", "Podcast / Recording"]
  },
  "blogCategories": ["Hosting Tips", "Event Space", "Meeting Space", "Shoot Location", "Guide", "Venly News"]
}'::jsonb);

-- ============================================================
-- CONTACT MESSAGES
-- From the public Contact page. Note: the contact form doesn't
-- actually save anywhere yet (it just shows a fake success
-- screen) — this table is ready for when that gets wired up.
-- ============================================================
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);
alter table public.messages enable row level security;
create policy "Anyone can submit a message" on public.messages for insert with check (true);
create policy "Admins can manage all messages" on public.messages for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- MIGRATION NOTE — only relevant if you already ran the OLD
-- version of this file on a live Supabase project (the one with
-- "status text default 'draft'" and "venue_photos" as a separate
-- table). Running the script above as-is will fail with "relation
-- already exists" errors on a project that already has these
-- tables. If that's your situation, run this block INSTEAD of the
-- "create table public.venues" statement above:
--
--   alter table public.venues add column if not exists host_email text;
--   alter table public.venues add column if not exists enquiry_email text;
--   alter table public.venues add column if not exists effective_enquiry_email text;
--   alter table public.venues add column if not exists is_live boolean default false;
--   alter table public.venues add column if not exists subscription_status text default 'none';
--   alter table public.venues add column if not exists created_by text default 'host';
--   alter table public.venues add column if not exists photos text[] default '{}';
--   -- migrate old separate venue_photos rows into the new photos[] column, oldest position first:
--   update public.venues v set photos = (
--     select coalesce(array_agg(p.url order by p.position), '{}')
--     from public.venue_photos p where p.venue_id = v.id
--   );
--   -- old "status" text column ('draft'/'live') can be migrated to the new is_live boolean:
--   update public.venues set is_live = (status = 'live') where status is not null;
--
-- Then run the rest of this file (favourites/enquiries/subscriptions/
-- blog_posts/platform_filters/messages) normally, skipping any
-- "create table" statement for a table you already have.
-- ============================================================

-- ============================================================
-- DONE! You should see "Success. No rows returned" in Supabase
-- ============================================================
