-- =====================================================
-- CoVibe Database Schema
-- Execute this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  gender TEXT NOT NULL CHECK (gender IN ('man', 'woman', 'non_binary', 'prefer_not_to_say')),
  city TEXT NOT NULL CHECK (city IN ('vancouver', 'montreal', 'toronto')),
  bio TEXT NOT NULL,
  photo_url TEXT,
  
  -- Quiz answers / Lifestyle
  productive_time TEXT NOT NULL CHECK (productive_time IN ('early', 'day', 'late', 'night')),
  weekend_style TEXT NOT NULL CHECK (weekend_style IN ('creative', 'social', 'chill', 'active')),
  creative_type TEXT NOT NULL CHECK (creative_type IN ('musician', 'artist', 'content_creator', 'photographer', 'developer', 'writer', 'entrepreneur', 'other')),
  living_space_style TEXT NOT NULL CHECK (living_space_style IN ('creative', 'organized', 'cozy', 'social')),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  priority TEXT NOT NULL CHECK (priority IN ('private', 'social', 'budget', 'values')),
  
  -- Religion & Diet
  religious_practice TEXT CHECK (religious_practice IN ('none', 'muslim', 'christian', 'jewish', 'vegetarian_vegan', 'spiritual', 'secular', 'other')),
  seeks_same_religion BOOLEAN DEFAULT FALSE,
  
  -- Substances
  alcohol_ok BOOLEAN DEFAULT TRUE,
  cannabis_friendly BOOLEAN DEFAULT FALSE,
  no_substances BOOLEAN DEFAULT FALSE,
  
  -- Safe Space & Inclusivity
  lgbtq_friendly BOOLEAN DEFAULT TRUE,
  safe_space_preferences TEXT[], -- Array for multiple selections
  
  -- Preferences / Deal-breakers
  smoking BOOLEAN DEFAULT FALSE,
  pets BOOLEAN DEFAULT FALSE,
  pets_ok BOOLEAN DEFAULT TRUE,
  noise_tolerance INTEGER DEFAULT 5 CHECK (noise_tolerance >= 1 AND noise_tolerance <= 5),
  guests_frequency INTEGER DEFAULT 3 CHECK (guests_frequency >= 1 AND guests_frequency <= 5),
  
  -- Budget
  budget_min INTEGER NOT NULL,
  budget_max INTEGER NOT NULL,
  move_in_date DATE,
  
  -- Meta
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. RLS POLICIES
-- =====================================================

-- Policy: Everyone can read all profiles (for matching)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users cannot delete profiles (for data integrity)
-- If you want to allow deletion:
-- CREATE POLICY "Users can delete their own profile"
--   ON profiles FOR DELETE
--   USING (auth.uid() = id);

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

-- Index on city (for filtering matches by location)
CREATE INDEX idx_profiles_city ON profiles(city);

-- Index on onboarding_complete (to filter only completed profiles)
CREATE INDEX idx_profiles_onboarding ON profiles(onboarding_complete);

-- Index on created_at (for sorting by join date)
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- Composite index for common queries (city + onboarding_complete)
CREATE INDEX idx_profiles_city_onboarding ON profiles(city, onboarding_complete);

-- =====================================================
-- 5. TRIGGER FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that calls the function
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. STORAGE BUCKET POLICIES (Run separately in Storage UI)
-- =====================================================

-- After creating the 'profile-photos' bucket, run these policies:

-- Allow authenticated users to upload their own photos
-- CREATE POLICY "Users can upload their own photos"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow everyone to read photos (public access)
-- CREATE POLICY "Photos are publicly accessible"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'profile-photos');

-- =====================================================
-- 7. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment to insert sample profiles for testing
-- Note: You need to create actual auth users first

-- INSERT INTO profiles (
--   id, email, name, age, city, bio, photo_url,
--   productive_time, weekend_style, creative_type, living_space_style,
--   cleanliness, priority, smoking, pets, pets_ok,
--   noise_tolerance, guests_frequency,
--   budget_min, budget_max, onboarding_complete
-- ) VALUES (
--   'sample-uuid-1', 'test1@example.com', 'Alex Developer', 26, 'vancouver',
--   'Full-stack dev qui code la nuit, cherche coloc qui comprend les horaires flexibles',
--   'https://via.placeholder.com/150',
--   'night', 'creative', 'developer', 'organized',
--   4, 'private', false, false, true,
--   3, 2,
--   800, 1200, true
-- );

-- =====================================================
-- DONE! Your database is ready.
-- =====================================================

-- Next steps:
-- 1. Go to Storage and create 'profile-photos' bucket (public)
-- 2. Add the storage policies shown above
-- 3. Copy your Project URL and anon key to .env file
-- 4. Start building! 🚀
