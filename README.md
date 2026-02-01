# 🏠 CoVibe - Creative Roommate Matching Platform

CoVibe est une plateforme de matching de colocs basée sur le lifestyle et la créativité. Contrairement aux apps traditionnelles, CoVibe connecte les créateurs, musiciens, développeurs et artistes avec des colocs qui partagent leur mode de vie.

## ✨ Features

- ✅ **Authentification sécurisée** (Email + Password)
- ✅ **Quiz d'onboarding détaillé** (10 questions)
- ✅ **Algorithme de matching intelligent** basé sur lifestyle, horaires, créativité
- ✅ **Score de compatibilité** (0-100%)
- ✅ **Profils détaillés** avec photos
- ✅ **Filtres par ville** (Vancouver, Montréal)
- ✅ **Vérification photo** pour la sécurité
- ✅ **Design moderne** cohérent avec la landing page

## 🛠️ Stack Technique

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Déploiement**: Vercel

## 📦 Installation

### 1. Clone le repo

```bash
git clone <ton-repo-url>
cd covibe-app
```

### 2. Installe les dépendances

```bash
npm install
```

### 3. Configure Supabase

#### A. Crée un projet Supabase

1. Va sur [https://app.supabase.com](https://app.supabase.com)
2. Clique sur "New Project"
3. Remplis les informations:
   - Name: `covibe`
   - Database Password: (choisis un mot de passe fort)
   - Region: Choisis la région la plus proche

#### B. Crée la table `profiles`

Va dans l'onglet "SQL Editor" et exécute ce SQL:

```sql
-- Table profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 35),
  city TEXT NOT NULL CHECK (city IN ('vancouver', 'montreal')),
  bio TEXT NOT NULL,
  photo_url TEXT,
  
  -- Quiz answers
  productive_time TEXT NOT NULL CHECK (productive_time IN ('early', 'day', 'late', 'night')),
  weekend_style TEXT NOT NULL CHECK (weekend_style IN ('creative', 'social', 'chill', 'active')),
  creative_type TEXT NOT NULL CHECK (creative_type IN ('musician', 'artist', 'content_creator', 'photographer', 'developer', 'writer', 'entrepreneur', 'other')),
  living_space_style TEXT NOT NULL CHECK (living_space_style IN ('creative', 'organized', 'cozy', 'social')),
  cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
  priority TEXT NOT NULL CHECK (priority IN ('private', 'social', 'budget', 'values')),
  
  -- Preferences
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all profiles
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

-- Index for faster queries
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_onboarding ON profiles(onboarding_complete);
```

#### C. Configure le Storage pour les photos

1. Va dans "Storage" > "Create a new bucket"
2. Name: `profile-photos`
3. Public bucket: ✅ (activé)
4. Click "Create bucket"

5. Va dans "Policies" pour ce bucket et ajoute:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow everyone to read photos
CREATE POLICY "Photos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');
```

#### D. Récupère tes clés API

1. Va dans "Settings" > "API"
2. Copie:
   - `Project URL` → Ce sera ton `VITE_SUPABASE_URL`
   - `anon public` key → Ce sera ton `VITE_SUPABASE_ANON_KEY`

### 4. Configure les variables d'environnement

```bash
cp .env.example .env
```

Édite `.env` et ajoute tes valeurs Supabase:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

### 5. Lance l'app en local

```bash
npm run dev
```

L'app sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🚀 Déploiement sur Vercel

### 1. Push ton code sur GitHub

```bash
git init
git add .
git commit -m "Initial commit - CoVibe app"
git branch -M main
git remote add origin <ton-repo-github-url>
git push -u origin main
```

### 2. Déploie sur Vercel

1. Va sur [vercel.com](https://vercel.com)
2. Clique "Import Project"
3. Sélectionne ton repo GitHub
4. Configure les variables d'environnement:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Clique "Deploy"

**C'est tout ! Ton app sera live en 2-3 minutes.**

## 🎯 Algorithme de Matching

L'algorithme calcule un score de compatibilité sur 100 basé sur:

- **Schedule (30%)**: Matching entre noctambules, matinaux, etc.
- **Lifestyle (25%)**: Type créatif, activités weekend
- **Living Style (20%)**: Propreté, type d'espace
- **Values (15%)**: Priorités personnelles
- **Deal-breakers (10%)**: Fumeur, animaux, bruit, invités

**Matches affichés**: Seulement 60%+ de compatibilité

## 📊 Structure des Données

```javascript
Profile {
  // Basics
  id: UUID
  name: string
  age: number (18-35)
  city: 'vancouver' | 'montreal'
  bio: string
  photo_url: string
  
  // Lifestyle
  productive_time: 'early' | 'day' | 'late' | 'night'
  creative_type: 'musician' | 'artist' | 'content_creator' | ...
  weekend_style: 'creative' | 'social' | 'chill' | 'active'
  living_space_style: 'creative' | 'organized' | 'cozy' | 'social'
  
  // Preferences
  cleanliness: 1-5
  priority: 'private' | 'social' | 'budget' | 'values'
  smoking: boolean
  pets: boolean
  pets_ok: boolean
  noise_tolerance: 1-5
  guests_frequency: 1-5
  
  // Budget
  budget_min: number
  budget_max: number
  move_in_date: date
}
```

## 🔐 Sécurité

- ✅ Authentification Supabase (tokens JWT)
- ✅ Row Level Security (RLS) sur toutes les tables
- ✅ Vérification email obligatoire
- ✅ Photo de profil requise
- ✅ Âge vérifié (18-35 ans)
- ✅ Validation des données côté serveur

## 📈 Prochaines Features

- [ ] Chat en temps réel entre matches
- [ ] Notifications push
- [ ] Système de "like" mutuel avant de révéler les contacts
- [ ] Plus de villes (Toronto, Calgary, Ottawa)
- [ ] Filtres avancés
- [ ] Verification ID (optionnelle)
- [ ] Reviews/ratings
- [ ] Import Google Calendar pour voir disponibilités

## 💰 Monétisation

**Phase 1 (MVP):**
- Founding Members: $49 lifetime access (100 premiers)

**Phase 2:**
- Freemium: 3 matches/semaine gratuits
- Premium: $19.99/mois - Matches illimités

**Phase 3:**
- Commission sur baux signés via la plateforme

## 🐛 Debug

Si tu as des problèmes:

1. **Auth ne fonctionne pas**: Vérifie que tes clés Supabase sont correctes dans `.env`
2. **Photos ne s'upload pas**: Vérifie que le bucket `profile-photos` est public et que les policies sont activées
3. **Pas de matches**: Assure-toi qu'il y a d'autres profils dans la même ville avec `onboarding_complete = true`

## 📞 Support

Questions? Ouvre une issue sur GitHub ou contacte [@ton-handle]

---

**Built with ❤️ by [Ton Nom]**
