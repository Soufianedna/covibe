# ✅ CORRECTION ÂGE - 18-60+ ans

## Modifications effectuées:

### 1. **supabase-schema.sql**
```sql
age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100)
```
✅ Changé de 19 à **18 ans minimum**

### 2. **Onboarding.jsx**
```javascript
{ name: 'age', label: 'Âge', type: 'number', min: 18, max: 100, required: true }
```
✅ Changé de 19 à **18 ans minimum**

### 3. **MODIFICATIONS-V2.md**
✅ Documentation mise à jour

---

## Âge final: **18-60+ ans** 🎂

**Pourquoi 18 ans?**
- Âge légal de la majorité au Canada
- Permet aux étudiants de 18 ans en 1ère année de s'inscrire
- Standard pour les apps de location

**C'est tout bon! 🚀**
