import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Logo } from './Logo';
import { useTranslation } from 'react-i18next';

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
            <h1 className="text-4xl font-black bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              CoVibe
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
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-slate-600"></div>
              <span className="text-gray-400 text-sm">ou</span>
              <div className="flex-1 h-px bg-slate-600"></div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: 'https://www.covibe.ca' }
                });
              }}
              className="w-full py-3 bg-white text-gray-800 rounded-xl font-bold text-base hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
            >
              <img src="https://www.google.com/favicon.ico" width="20" height="20" alt="Google" />
              Continuer avec Google
            </button>
          </form>


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
