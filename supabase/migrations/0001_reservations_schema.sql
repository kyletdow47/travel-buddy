-- Unified reservation schema
-- Base table holds fields common to every reservation type.
-- Per-type tables extend the base via a FK and hold type-specific fields.
--
-- This shape lets the client:
--   * query all reservations for a trip in one go (timeline view)
--   * join the matching subtype table when rendering detail sheets
--   * parse emails into the right subtype while always creating a base row

-- ---------- Enums ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'reservation_type') then
    create type reservation_type as enum (
      'flight',
      'lodging',
      'car',
      'train',
      'activity'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'reservation_status') then
    create type reservation_status as enum (
      'pending',    -- parsed but awaiting user approval
      'confirmed',  -- approved / manually added
      'cancelled'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'reservation_source') then
    create type reservation_source as enum (
      'manual',
      'email',
      'import'
    );
  end if;
end$$;

-- ---------- Base reservation ----------
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  type reservation_type not null,
  status reservation_status not null default 'confirmed',
  source reservation_source not null default 'manual',

  -- Human-facing label (e.g. "UA 432 SFO → JFK", "Hotel Kyoto")
  title text not null,

  -- Provider / supplier (airline, hotel chain, rental co., tour op.)
  provider text,

  -- Booking reference from the provider (PNR, confirmation #)
  confirmation_number text,

  -- Monetary total in the smallest useful unit (dollars/euros — kept as numeric).
  -- currency is ISO-4217 (USD, EUR, JPY…). Nullable because some parsed
  -- emails arrive without a total.
  total_cost numeric(12, 2),
  currency text,

  -- Primary anchor moments. Subtype tables hold richer detail (segments, legs).
  start_at timestamptz,
  end_at timestamptz,

  -- Free-form user notes
  notes text,

  -- Raw email / import payload so we can re-parse later without re-ingestion
  raw_payload jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reservations_trip_id_idx on public.reservations(trip_id);
create index if not exists reservations_type_idx on public.reservations(type);
create index if not exists reservations_status_idx on public.reservations(status);
create index if not exists reservations_start_at_idx on public.reservations(start_at);

-- Keep updated_at fresh on every write
create or replace function public.set_reservations_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists reservations_set_updated_at on public.reservations;
create trigger reservations_set_updated_at
  before update on public.reservations
  for each row execute function public.set_reservations_updated_at();

-- ---------- Flight ----------
-- A reservation can hold multiple legs (outbound/return, connections).
create table if not exists public.reservation_flights (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,

  -- Leg ordering within the reservation (0, 1, 2…)
  leg_index integer not null default 0,

  airline text,
  flight_number text,

  origin_airport text,       -- IATA code (SFO)
  origin_city text,
  origin_terminal text,
  destination_airport text,  -- IATA code (JFK)
  destination_city text,
  destination_terminal text,

  departure_at timestamptz,
  arrival_at timestamptz,

  cabin_class text,          -- Economy / Premium / Business / First
  seat text,

  created_at timestamptz not null default now()
);

create unique index if not exists reservation_flights_leg_unique
  on public.reservation_flights(reservation_id, leg_index);
create index if not exists reservation_flights_reservation_id_idx
  on public.reservation_flights(reservation_id);

-- ---------- Lodging ----------
create table if not exists public.reservation_lodging (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,

  property_name text,
  address text,
  city text,
  country text,
  lat double precision,
  lng double precision,

  check_in_at timestamptz,
  check_out_at timestamptz,

  room_type text,
  num_guests integer,
  nightly_rate numeric(12, 2),

  created_at timestamptz not null default now()
);

create index if not exists reservation_lodging_reservation_id_idx
  on public.reservation_lodging(reservation_id);

-- ---------- Car rental ----------
create table if not exists public.reservation_cars (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,

  rental_company text,
  vehicle_class text,       -- Economy, SUV, Luxury…
  vehicle_description text, -- e.g. "Toyota Corolla or similar"

  pickup_location text,
  pickup_at timestamptz,
  dropoff_location text,
  dropoff_at timestamptz,

  driver_name text,

  created_at timestamptz not null default now()
);

create index if not exists reservation_cars_reservation_id_idx
  on public.reservation_cars(reservation_id);

-- ---------- Train ----------
create table if not exists public.reservation_trains (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,

  leg_index integer not null default 0,

  operator text,             -- Amtrak, SNCF, JR, Eurostar…
  train_number text,

  origin_station text,
  origin_city text,
  destination_station text,
  destination_city text,

  departure_at timestamptz,
  arrival_at timestamptz,

  car text,
  seat text,
  fare_class text,

  created_at timestamptz not null default now()
);

create unique index if not exists reservation_trains_leg_unique
  on public.reservation_trains(reservation_id, leg_index);
create index if not exists reservation_trains_reservation_id_idx
  on public.reservation_trains(reservation_id);

-- ---------- Activity ----------
-- Tours, restaurant bookings, museum tickets, excursions.
create table if not exists public.reservation_activities (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,

  activity_name text,
  vendor text,
  location text,
  lat double precision,
  lng double precision,

  starts_at timestamptz,
  ends_at timestamptz,

  num_participants integer,
  meeting_point text,

  created_at timestamptz not null default now()
);

create index if not exists reservation_activities_reservation_id_idx
  on public.reservation_activities(reservation_id);

-- ---------- Row Level Security ----------
-- Travel Buddy v1 is single-user-per-device (trips are not yet owned by a
-- user id). Leave RLS disabled here to match the rest of the schema; we can
-- retrofit policies once the auth layer lands (EPIC 19 already shipped
-- onboarding but trip ownership is still anon-scoped).
alter table public.reservations disable row level security;
alter table public.reservation_flights disable row level security;
alter table public.reservation_lodging disable row level security;
alter table public.reservation_cars disable row level security;
alter table public.reservation_trains disable row level security;
alter table public.reservation_activities disable row level security;
