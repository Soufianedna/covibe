# 🚀 Quick Start Guide - CoVibe

**Temps estimé: 20 minutes**

## ✅ Checklist

- [ ] Compte Supabase créé
- [ ] Projet Supabase configuré
- [ ] Variables d'environnement configurées
- [ ] App lancée localement
- [ ] Premier compte créé et testé

## 📝 Étapes Rapides

### 1. Installation (2 min)

```bash
# Clone (ou dézip) le projet
cd covibe-app

# Installe les dépendances
npm install
```

### 2. Setup Supabase (10 min)

#### A. Crée ton projet

1. 🌐 Va sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. ➕ Clique "New Project"
3. ✏️ Remplis:
   - **Name**: `covibe`
   - **Password**: (choisis un mot de passe fort et NOTE-LE)
   - **Region**: `East US (North Virginia)` ou le plus proche de toi
4. ⏳ Attends 2-3 minutes que le projet se crée

#### B. Configure la base de données

1. 📊 Va dans l'onglet "SQL Editor"
2. 📋 Copie TOUT le contenu de `supabase-schema.sql`
3. 📝 Colle-le dans l'éditeur SQL
4. ▶️ Clique "Run" (en bas à droite)
5. ✅ Tu devrais voir "Success. No rows returned"

#### C. Configure le Storage

1. 🗂️ Va dans "Storage" (menu gauche)
2. ➕ Clique "Create a new bucket"
3. ✏️ Nom: `profile-photos`
4. 🌍 **Public bucket**: ✅ ACTIVE cette option
5. 💾 Clique "Create bucket"
6. ⚙️ Clique sur le bucket > "Policies"
7. ➕ Clique "New Policy" > "For full customization"
8. 📋 Ajoute cette policy pour l'upload:

```sql
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos');
```

9. ➕ Ajoute une 2e policy pour la lecture:

```sql
CREATE POLICY "Photos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');
```

#### D. Récupère tes clés

1. ⚙️ Va dans "Settings" > "API"
2. 📋 Copie ces deux valeurs:
   - **Project URL** (commence par `https://xxx.supabase.co`)
   - **anon public** key (très long, commence par `eyJ...`)

### 3. Configure l'app (2 min)

```bash
# Copie le fichier .env.example
cp .env.example .env

# Édite .env avec tes clés Supabase
# Utilise nano, vim, VS Code, ou n'importe quel éditeur
nano .env
```

Colle tes valeurs:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Sauvegarde** (Ctrl+O puis Ctrl+X si tu utilises nano)

### 4. Lance l'app (1 min)

```bash
npm run dev
```

🎉 Ouvre ton navigateur sur [http://localhost:3000](http://localhost:3000)

### 5. Teste l'app (5 min)

1. ✅ Clique "Inscription"
2. ✏️ Entre un email et mot de passe
3. 📧 **IMPORTANT**: Va vérifier ton email et clique sur le lien de confirmation
4. 🎯 Complete le quiz d'onboarding (10 questions)
5. 📸 Upload une photo
6. 🔥 Explore ton dashboard!

## 🐛 Problèmes Courants

### "Invalid API key"
- ✅ Vérifie que tu as bien copié la clé complète (elle est très longue!)
- ✅ Assure-toi qu'il n'y a pas d'espaces avant/après
- ✅ Vérifie que le fichier s'appelle `.env` et pas `.env.txt`

### "relation profiles does not exist"
- ✅ Tu as oublié de run le SQL! Va dans SQL Editor et exécute `supabase-schema.sql`

### "Failed to upload photo"
- ✅ Vérifie que le bucket `profile-photos` existe
- ✅ Vérifie que le bucket est PUBLIC
- ✅ Vérifie que les policies sont créées

### "No matches found"
- ✅ C'est normal si tu es le seul utilisateur!
- ✅ Crée 2-3 comptes test avec des emails différents
- ✅ Ou attends que d'autres utilisateurs s'inscrivent

## 🚀 Déploiement (5 min)

Une fois que tout fonctionne localement:

1. 📦 Push sur GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <ton-repo-url>
git push -u origin main
```

2. 🌐 Va sur [vercel.com](https://vercel.com)
3. ➕ "Import Project"
4. 🔗 Sélectionne ton repo
5. ⚙️ Ajoute les variables d'environnement:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. 🚀 Clique "Deploy"

⏳ Attends 2-3 minutes... **Et voilà, ton app est live!**

## 🎯 Prochaines Étapes

- [ ] Partage le lien avec tes premiers utilisateurs
- [ ] Collecte du feedback
- [ ] Itère sur le produit
- [ ] Ajoute des features (chat, notifications, etc.)

## 💪 Besoin d'Aide?

- 📖 Lis le `README.md` complet pour plus de détails
- 🐛 Ouvre une issue sur GitHub
- 💬 Contacte-moi directement

---

**Tu es prêt! Let's build something amazing! 🔥**
