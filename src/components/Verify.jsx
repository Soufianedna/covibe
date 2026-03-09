import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

export const Verify = ({ token }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const { data, error } = await supabase
          .from('verification_tokens')
          .select('*')
          .eq('token', token)
          .single();

        if (error || !data) {
          setStatus('invalid');
          return;
        }

        if (data.used) {
          setStatus('used');
          return;
        }

        if (new Date(data.expires_at) < new Date()) {
          setStatus('expired');
          return;
        }

        // Mark token as used
        await supabase
          .from('verification_tokens')
          .update({ used: true })
          .eq('token', token);

        // Update profile as verified
        await supabase
          .from('profiles')
          .update({ verified: true })
          .eq('user_id', data.user_id);

        setStatus('success');
      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-black mb-4">
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            CoVibe
          </span>
        </h1>

        {status === 'loading' && (
          <div>
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-white text-xl">{t('verifying')}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-slate-800/50 border border-violet-500/30 rounded-3xl p-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('profileVerified')}</h2>
            <p className="text-gray-400 mb-6">{t('verifiedBadge')} 🎉</p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all"
            >
              {t('backToCovibe')} 🏠
            </button>
          </div>
        )}

        {(status === 'invalid' || status === 'used' || status === 'expired' || status === 'error') && (
          <div className="bg-slate-800/50 border border-red-500/30 rounded-3xl p-8">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('invalidLink')}</h2>
            <p className="text-gray-400 mb-6">
              {status === 'expired' ? t('linkExpired') : 
               status === 'used' ? t('linkUsed') : 
               t('invalidLinkGeneric')}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-lg transition-all"
            >
              {t('backToCovibe')} 🏠
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
