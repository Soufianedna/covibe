import { Routes, Route } from 'react-router-dom';
import { Privacy } from './components/legal/Privacy';
import { Terms } from './components/legal/Terms';
import { Cookies } from './components/legal/Cookies';
import { Mentions } from './components/legal/Mentions';
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
    setShowAuth(false);
  };

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  const urlParams = new URLSearchParams(window.location.search);
  const verifyToken = urlParams.get('token');
  if (verifyToken) {
    return <Verify token={verifyToken} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-white text-xl font-semibold">Chargement...</p>
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
