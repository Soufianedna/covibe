import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Logo } from './Logo';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            }
          }
        });

        if (error) throw error;

        setSuccess('✅ Compte créé ! Vérifie ton email pour confirmer.');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Logo size={60} />
            <h1 className="text-4xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              CoVibe
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            {isLogin ? 'Matche avec ton futur coloc 💫' : 'Trouve ton coloc par vibe'}
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-pink-500/30 rounded-3xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Jean Dupont"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="ton@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="••••••••"
              />
              {!isLogin && (
                <p className="text-xs text-gray-400 mt-1">
                  Minimum 6 caractères
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-3">
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : isLogin ? 'Se connecter →' : 'Créer mon compte →'}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <a href="#" className="text-sm text-pink-400 hover:text-pink-300">
                Mot de passe oublié ?
              </a>
            </div>
          )}
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-pink-400 hover:text-pink-300 font-semibold"
          >
            {isLogin ? 'Inscris-toi' : 'Connecte-toi'}
          </button>
        </p>
      </div>
    </div>
  );
};
