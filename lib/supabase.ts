/*
 * Supabase client for client-side usage.
 *
 * SETUP: Run the following SQL in your Supabase dashboard to create the required tables:
 *
 * -- Tours table
 * create table tours (
 *   id uuid default gen_random_uuid() primary key,
 *   name text not null,
 *   slug text unique not null,
 *   description text,
 *   duration text,
 *   price decimal(10,2),
 *   category text, -- 'airport_transfer', 'day_tour', 'overnight'
 *   images text[],
 *   highlights text[],
 *   available boolean default true,
 *   created_at timestamp with time zone default now()
 * );
 *
 * -- Bookings table
 * create table bookings (
 *   id uuid default gen_random_uuid() primary key,
 *   tour_id uuid references tours(id),
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
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
