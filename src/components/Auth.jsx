import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Logo } from './Logo';
import { useTranslation } from 'react-i18next';
import '@fontsource/pacifico';

export const Auth = () => {
  const { t } = useTranslation();
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
            emailRedirectTo: 'covibe://login-callback',
            data: {
              name: name,
            }
          }
        });

        if (error) throw error;

        setSuccess(t('accountCreated'));
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Logo size={60} />
            <h1 className="text-4xl bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent" style={{fontFamily: "'Pacifico', cursive"}}>
              Covibe
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            {isLogin ? t('welcomeSubtitle') : t('welcomeSubtitle')}
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-violet-500/30 rounded-3xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {t('login')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {t('signup')}
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder={ t('fullNamePlaceholder') }
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder={ t('emailPlaceholder') }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder={ t('passwordPlaceholder') }
              />
              {!isLogin && (
                <p className="text-xs text-gray-400 mt-1">
                  {t('passwordPlaceholder')}
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
              className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : isLogin ? t('connect') : t('createAccount')}
            </button>
          </form>

          <div className="mt-4">
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-600"></div>
              <span className="text-gray-400 text-sm">ou</span>
              <div className="flex-1 h-px bg-slate-600"></div>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: 'covibe://login-callback' }
                  });
                  if (error) throw error;
                } catch(e) {
                  alert('Google error: ' + (e.message || JSON.stringify(e)));
                }
              }}
              className="w-full py-3 bg-white text-gray-800 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-100 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Continuer avec Google
            </button>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-600"></div>
              <span className="text-gray-400 text-sm">ou</span>
              <div className="flex-1 h-px bg-slate-600"></div>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: 'covibe://login-callback' } });
                  if (oauthError) console.error('Apple OAuth error:', oauthError);
                } catch(e) {
                  console.error('Apple Sign In error:', e);
                }
              }}
              className="w-full py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-900 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 814 1000" fill="white"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46 790.1 0 663.5 0 541.8c0-207.1 135.4-316.6 268.5-316.6 71 0 130.3 46.9 174.7 46.9 42.8 0 109.9-49.5 188.6-49.5 30.1 0 108.2 2.6 168.5 80.1zm-80.7-160.8c-33.4 39.5-95.7 70.1-148.3 70.1-6.4 0-12.8-.6-19.2-1.9-1.9-8.3-2.6-16.6-2.6-25.6 0-36.8 19.2-75.6 47.6-103 28.1-27.5 73.1-48.1 113-49.5 1.3 7 1.9 14 1.9 20.4 0 37.4-15.3 74.9-42.4 109.5z"/></svg>
              Continuer avec Apple
            </button>
          </div>
          {isLogin && (
            <div className="mt-4 text-center">
              <a href="#" onClick={async (e) => { e.preventDefault(); if (!email) { alert(t('enterEmailFirst') || 'Entre ton email d\'abord'); return; } const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://www.covibe.ca/reset-password' }); if (!error) { alert(t('resetEmailSent') || 'Email de réinitialisation envoyé !'); } }} className="text-sm text-violet-400 hover:text-violet-300">
                {t('forgotPassword')}
              </a>
            </div>
          )}
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          {isLogin ? t('noAccountYet') : t('alreadyHaveAccount')}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-violet-400 hover:text-violet-300 font-semibold"
          >
            {isLogin ? t('signUp') : t('signIn')}
          </button>
        </p>
      </div>
    </div>
  );
};
