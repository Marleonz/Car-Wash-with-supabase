/*
  # Initial Schema for Rasov Wash

  1. New Tables
    - `profiles`
      - Stores user profile information
      - Links to Supabase auth.users
    - `vehicles`
      - Stores registered vehicles for each user
    - `services`
      - Available car wash services
    - `bookings`
      - Stores booking information
      - Links services, vehicles, and users

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  phone_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  brand text NOT NULL,
  model text NOT NULL,
  plate_number text NOT NULL,
  vehicle_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal NOT NULL,
  duration_minutes integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view their own vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own vehicles"
  ON vehicles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view services"
  ON services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert initial services
INSERT INTO services (name, description, price, duration_minutes) VALUES
('Basic Wash', 'Exterior wash with hand dry', 50000, 30),
('Premium Wash', 'Exterior wash, interior vacuum, and dashboard cleaning', 100000, 60),
('Deluxe Package', 'Complete interior and exterior detailing', 200000, 120),
('Express Wash', 'Quick exterior wash for busy customers', 35000, 20);