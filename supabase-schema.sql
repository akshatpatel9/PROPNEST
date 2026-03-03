-- Run this entire script in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  saved_properties TEXT[] DEFAULT '{}'
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id),
  seller_name TEXT,
  seller_email TEXT,
  seller_phone TEXT,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  lat NUMERIC,
  lng NUMERIC,
  image_url TEXT,
  status TEXT DEFAULT 'active',
  liked_by UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Disable Row Level Security (RLS) for easy prototyping
-- Note: In a production app, you should enable RLS and write proper policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;

-- Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Disable RLS for prototyping
ALTER TABLE inquiries DISABLE ROW LEVEL SECURITY;
