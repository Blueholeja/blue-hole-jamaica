/*
 * Supabase client for client-side usage.
 *
 * SETUP: Run the following SQL in your Supabase dashboard to create the required tables:
 *
 * -- Tours table (id is text, not uuid, to match the app's existing tour IDs)
 * create table tours (
 *   id text primary key,
 *   name text not null,
 *   slug text unique not null,
 *   description text,
 *   duration text,
 *   price decimal(10,2),
 *   category text, -- 'airport_transfer', 'day_tour', 'overnight'
 *   images text[],
 *   highlights text[],
 *   available boolean default true,
 *   display_order integer, -- explicit sort order; NULL sorts last (new tours append at the end)
 *   created_at timestamp with time zone default now()
 * );
 *
 * -- Bookings table
 * create table bookings (
 *   id uuid default gen_random_uuid() primary key,
 *   tour_id text references tours(id),
 *   customer_name text not null,
 *   email text not null,
 *   phone text,
 *   date date not null,
 *   guests integer default 1,
 *   special_requests text,
 *   decline_reason text,
 *   status text default 'pending', -- pending, confirmed, declined, completed
 *   payment_status text default 'unpaid', -- unpaid, paid, refunded
 *   payment_id text,
 *   total_amount decimal(10,2),
 *   created_at timestamp with time zone default now()
 * );
 *
 * -- Inquiries table
 * create table inquiries (
 *   id uuid default gen_random_uuid() primary key,
 *   name text not null,
 *   email text not null,
 *   phone text,
 *   subject text,
 *   message text not null,
 *   status text default 'unread', -- unread, read, responded
 *   created_at timestamp with time zone default now()
 * );
 *
 * -- Enable Row Level Security (optional but recommended)
 * alter table tours enable row level security;
 * alter table bookings enable row level security;
 * alter table inquiries enable row level security;
 *
 * -- Allow public read for tours
 * create policy "Tours are publicly readable" on tours for select using (true);
 *
 * -- Allow public insert for bookings and inquiries
 * create policy "Anyone can create a booking" on bookings for insert with check (true);
 * create policy "Anyone can create an inquiry" on inquiries for insert with check (true);
 *
 * -- Customers table (registered accounts; guest checkout still works without one)
 * create table customers (
 *   id uuid default gen_random_uuid() primary key,
 *   email text unique not null,
 *   password_hash text not null,
 *   name text not null,
 *   phone text,
 *   email_verified boolean default false,
 *   verification_token text,
 *   reset_token text,
 *   reset_token_expires timestamp with time zone,
 *   created_at timestamp with time zone default now()
 * );
 *
 * -- Locked down: no anon policies. All access goes through the service-role
 * -- client in the /api/customers/* routes, never the public client.
 * alter table customers enable row level security;
 *
 * -- Saved favorite excursions/services per customer
 * create table favorites (
 *   id uuid default gen_random_uuid() primary key,
 *   customer_id uuid references customers(id) on delete cascade not null,
 *   tour_id text references tours(id) on delete cascade not null,
 *   created_at timestamp with time zone default now(),
 *   unique (customer_id, tour_id)
 * );
 * alter table favorites enable row level security;
 *
 * -- Saved booking preferences, for faster rebooking
 * alter table customers add column preferred_pickup_location text;
 * alter table customers add column typical_guests integer;
 *
 * -- Hotel room booking module: 10 individually tracked rooms, date-range
 * -- stays (distinct from the single-date `bookings` table above), and an
 * -- exclusion constraint that makes double-booking a room impossible even
 * -- under concurrent requests.
 * create extension if not exists btree_gist;
 *
 * create table rooms (
 *   id text primary key, -- 'single-1'..'single-8', 'double-1', 'double-2'
 *   room_number text not null,
 *   type text not null, -- 'single' | 'double'
 *   created_at timestamp with time zone default now()
 * );
 *
 * create table room_pricing (
 *   id text primary key, -- 'single_room_only', 'single_breakfast', 'single_breakfast_dinner', 'double_breakfast', 'double_breakfast_dinner'
 *   room_type text not null,
 *   package text not null, -- 'room_only' | 'breakfast' | 'breakfast_dinner'
 *   label text not null,
 *   price_per_night decimal(10,2) not null
 * );
 *
 * create table room_bookings (
 *   id uuid default gen_random_uuid() primary key,
 *   room_id text references rooms(id),
 *   guest_name text not null,
 *   email text not null,
 *   phone text,
 *   adults integer default 1,
 *   children integer default 0,
 *   check_in date not null,
 *   check_out date not null,
 *   stay_range daterange generated always as (daterange(check_in, check_out, '[)')) stored,
 *   room_type text not null,
 *   package text not null,
 *   price_per_night decimal(10,2) not null,
 *   nights integer generated always as (check_out - check_in) stored,
 *   total_amount decimal(10,2) not null,
 *   deposit_amount decimal(10,2) not null,
 *   special_requests text,
 *   status text default 'confirmed', -- confirmed, cancelled, completed
 *   payment_status text default 'unpaid', -- unpaid, deposit_paid, paid_in_full, refunded
 *   payment_id text,
 *   checked_in boolean default false,
 *   checked_out boolean default false,
 *   created_at timestamp with time zone default now(),
 *   exclude using gist (room_id with =, stay_range with &&) where (status in ('confirmed', 'completed'))
 * );
 *
 * alter table rooms enable row level security;
 * alter table room_pricing enable row level security;
 * alter table room_bookings enable row level security;
 * -- No anon policies — all access goes through the service-role client in
 * -- the /api/rooms/* and /api/room-bookings/* routes.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
