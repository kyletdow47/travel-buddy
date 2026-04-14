-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Trip meta fields for the Tripsy-style hero header + Organizer sheet
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

alter table public.trips
  add column if not exists cover_photo_url text,
  add column if not exists cover_photo_attribution jsonb,
  add column if not exists source text, -- 'manual' | 'import_email' | 'shared' | 'template'
  add column if not exists timezone text, -- IANA tz e.g. 'America/New_York'
  add column if not exists country_code text, -- ISO 3166-1 alpha-2 e.g. 'US'
  add column if not exists country_flag text, -- emoji fallback, e.g. '🇺🇸'
  add column if not exists archived_at timestamptz;

-- Partial index lets the Trips list query exclude archived trips cheaply.
create index if not exists trips_active_idx
  on public.trips (start_date)
  where archived_at is null;

comment on column public.trips.cover_photo_url is
  'Public URL to a hero photo (Unsplash or user-uploaded).';
comment on column public.trips.cover_photo_attribution is
  'JSON metadata for photo source, e.g. {"provider":"unsplash","author":"…","link":"…"}.';
comment on column public.trips.source is
  'Origin of the trip record: manual, import_email, shared, template.';
comment on column public.trips.timezone is
  'IANA timezone name for trip-local time rendering.';
comment on column public.trips.country_code is
  'ISO 3166-1 alpha-2 code used to render a flag.';
comment on column public.trips.country_flag is
  'Emoji fallback flag — useful if client cannot map the code.';
comment on column public.trips.archived_at is
  'When the user archived the trip (soft-delete). Null = active.';
