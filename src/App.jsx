import { Routes, Route, useNavigate } from 'react-router-dom';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { App as CapApp } from '@capacitor/app';
import { Privacy } from './components/legal/Privacy';
import { Terms } from './components/legal/Terms';
import { Cookies } from './components/legal/Cookies';
import { Mentions } from './components/legal/Mentions';
import '@fontsource/pacifico';
import { useState, useEffect } from 'react';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { supabase } from './lib/supabase';
import { Landing } from './components/Landing';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from "./components/Dashboard";
import { Verify } from './components/Verify';

function App() {
  return (
    <Routes>
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/mentions" element={<Mentions />} />
      <Route path="*" element={<AppContent />} />
    </Routes>
  );
}

function AppContent() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: '964731003706-ms57la8em2lb8dq6ambu6llc7h53g7sq.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
    CapApp.addListener('appUrlOpen', async ({ url }) => {
      if (url.includes('covibe://verify')) {
        const token = new URL(url.replace('covibe://', 'https://covibe.ca/')).searchParams.get('token');
        if (token) window.location.href = '/verify?token=' + token;
      }
      if (url.includes('covibe://reset-password')) {
        setShowResetPassword(true);
      }
      if (url.includes('/verify') && url.includes('token_hash')) {
        const params = new URLSearchParams(url.split('?')[1]);
        const tokenHash = params.get('token_hash');
        const type = params.get('type');
        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
          if (!error) setSession(await supabase.auth.getSession().then(r => r.data.session));
        }
      }
      if (url.includes('/reset-password') && url.includes('token_hash')) {
        const params = new URLSearchParams(url.split('?')[1]);
        const tokenHash = params.get('token_hash');
        if (tokenHash) {
          await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
          setShowResetPassword(true);
        }
      }
      if (url.includes('covibe://login-callback')) {
        console.log('🍎 CALLBACK URL:', url);
        const hashPart = url.includes('#') ? url.split('#')[1] : url.split('?')[1];
        const params = new URLSearchParams(hashPart);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        }
      }
    });
    return () => CapApp.removeAllListeners();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
        setLoading(false);
        return;
      }
      setSession(session);
      if (session) {
        loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = (profile) => {
    setUserProfile(profile);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserProfile(null);
    setShowAuth(false);
  };

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  if (showResetPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 flex items-center justify-center p-6">
        <div className="bg-slate-800/50 backdrop-blur-lg border border-violet-500/30 rounded-3xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Nouveau mot de passe</h2>
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4"
          />
          <button
            onClick={async () => {
              const { error } = await supabase.auth.updateUser({ password: newPassword });
              if (!error) {
                setShowResetPassword(false);
                alert('Mot de passe mis à jour !');
              } else {
                alert('Erreur: ' + error.message);
              }
            }}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Mettre à jour
          </button>
        </div>
      </div>
    );
  }

  const urlParams = new URLSearchParams(window.location.search);
  const verifyToken = urlParams.get('token');
  if (verifyToken) {
    return <Verify token={verifyToken} />;
  }

  const statusBarHeight = 'env(safe-area-inset-top)';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!session && !showAuth) {
    return <Landing onGetStarted={handleGetStarted} />;
  }

  if (!session) {
    return <Auth />;
  }

  if (!userProfile || !userProfile.onboarding_complete) {
    return (
      <Onboarding
        user={session.user}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <Dashboard
      user={session.user}
      userProfile={userProfile}
      onLogout={handleLogout}
    />
  );
}

export default App;
