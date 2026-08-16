-- CoVibe Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (main user data)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 35),
  city TEXT NOT NULL CHECK (city IN ('Vancouver', 'Montreal', 'Toronto')),
  phone TEXT,
  bio TEXT,
  
  -- Profile photos
  profile_photo_url TEXT,
  additional_photos TEXT[], -- Array of photo URLs
  
  -- Verification
  is_email_verified BOOLEAN DEFAULT false,
  is_photo_verified BOOLEAN DEFAULT false,
  verification_photo_url TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Quiz results / Lifestyle data
  schedule_type TEXT CHECK (schedule_type IN ('early', 'day', 'late', 'night')),
  weekend_style TEXT CHECK (weekend_style IN ('creative', 'social', 'chill', 'active')),
  living_space_style TEXT CHECK (living_space_style IN ('creative', 'organized', 'cozy', 'social')),
  priority TEXT CHECK (priority IN ('private', 'social', 'budget', 'values')),
  
  -- Detailed preferences
  occupation TEXT, -- e.g., "Musician", "Software Engineer", "Content Creator"
  occupation_category TEXT, -- 'creative', 'tech', 'business', 'student', 'other'
  work_from_home BOOLEAN,
  has_pets BOOLEAN,
  pets_ok BOOLEAN,
  smoker BOOLEAN,
  smoking_ok BOOLEAN,
  cleanliness_level INTEGER CHECK (cleanliness_level >= 1 AND cleanliness_level <= 5),
  noise_tolerance INTEGER CHECK (noise_tolerance >= 1 AND noise_tolerance <= 5),
  social_frequency TEXT CHECK (social_frequency IN ('daily', 'weekly', 'monthly', 'rarely')),
  
  -- Hobbies/interests (stored as array)
  hobbies TEXT[], -- e.g., ['music', 'coding', 'photography', 'gaming']
  
  -- Housing preferences
  budget_min INTEGER,
  budget_max INTEGER,
  move_in_date DATE,
  lease_length TEXT, -- '6-months', '1-year', 'flexible'
  room_type TEXT CHECK (room_type IN ('private', 'shared')),
  
  -- Matching preferences
  preferred_age_min INTEGER,
  preferred_age_max INTEGER,
  preferred_gender TEXT, -- 'any', 'male', 'female', 'non-binary'
  
  -- Account status
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  premium_until TIMESTAMP WITH TIME ZONE,
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id_1 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_id_2 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Compatibility score (0-100)
  compatibility_score INTEGER CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  
  -- Breakdown of score
  schedule_score INTEGER,
  lifestyle_score INTEGER,
  living_score INTEGER,
  values_score INTEGER,
  dealbreaker_score INTEGER,
  
  -- Match status
  status TEXT DEFAULT 'potential' CHECK (status IN ('potential', 'liked', 'matched', 'declined', 'blocked')),
  user_1_status TEXT CHECK (user_1_status IN ('pending', 'liked', 'declined')),
  user_2_status TEXT CHECK (user_2_status IN ('pending', 'liked', 'declined')),
  
  -- Timestamps
  matched_at TIMESTAMP WITH TIME ZONE, -- When both liked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 < user_id_2) -- Ensure consistent ordering
);

-- Conversations table
CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Participants
  user_id_1 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_id_2 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Last message info
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_text TEXT,
  last_message_sender UUID REFERENCES profiles(id),
  
  -- Read status
  user_1_last_read TIMESTAMP WITH TIME ZONE,
  user_2_last_read TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Message content
  content TEXT NOT NULL,
  
  -- Metadata
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_age ON profiles(age);
CREATE INDEX idx_profiles_occupation_category ON profiles(occupation_category);
CREATE INDEX idx_profiles_onboarding_completed ON profiles(onboarding_completed);
CREATE INDEX idx_matches_user_id_1 ON matches(user_id_1);
CREATE INDEX idx_matches_user_id_2 ON matches(user_id_2);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Row Level Security (RLS) Policies

-- Profiles: Users can read all active profiles, but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users" 
  ON profiles FOR SELECT 
  USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Matches: Users can see matches they're part of
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own matches" 
  ON matches FOR SELECT 
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can insert their own matches" 
  ON matches FOR INSERT 
  WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can update their own matches" 
  ON matches FOR UPDATE 
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Conversations: Users can only see conversations they're part of
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" 
  ON conversations FOR SELECT 
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can insert conversations for their matches" 
  ON conversations FOR INSERT 
  WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Messages: Users can only see messages in their conversations
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations" 
  ON messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.user_id_1 = auth.uid() OR conversations.user_id_2 = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages in their conversations" 
  ON messages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.user_id_1 = auth.uid() OR conversations.user_id_2 = auth.uid())
    )
  );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create a profile automatically when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for profile photos (run this in Supabase Storage UI or via SQL)
-- Note: This is done via Supabase dashboard → Storage → Create bucket
-- Bucket name: "profile-photos"
-- Public: true

-- Storage bucket for verification photos
-- Bucket name: "verification-photos"
-- Public: false (only accessible by admins)
