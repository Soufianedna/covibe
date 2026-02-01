import { X, MessageCircle } from 'lucide-react';

export const MatchModal = ({ currentUser, matchedUser, onClose, onOpenChat }) => {
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center p-6 z-[100]">
      <div className="relative max-w-2xl w-full">
        <button onClick={onClose} className="absolute -top-12 right-0 p-2 hover:bg-white/10 rounded-xl transition-all text-white">
          <X size={32} />
        </button>

        <div className="text-center mb-8">
          <h1 className="text-6xl md:text-8xl font-black mb-4">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              IT'S A MATCH!
            </span>
          </h1>
          <p className="text-2xl text-white font-semibold">Vous vous êtes likés mutuellement ! 🎉</p>
        </div>

        <div className="flex items-center justify-center gap-8 mb-8 relative">
          <div className="relative">
            {currentUser.photo_url ? (
              <img src={currentUser.photo_url} alt={currentUser.name} className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-8 border-pink-500 shadow-2xl shadow-pink-500/50" />
            ) : (
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-slate-700 flex items-center justify-center text-6xl border-8 border-pink-500">👤</div>
            )}
          </div>

          <div className="absolute text-6xl">🏠</div>

          <div className="relative">
            {matchedUser.photo_url ? (
              <img src={matchedUser.photo_url} alt={matchedUser.name} className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-8 border-purple-500 shadow-2xl shadow-purple-500/50" />
            ) : (
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-slate-700 flex items-center justify-center text-6xl border-8 border-purple-500">👤</div>
            )}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-pink-500/30 rounded-3xl p-8">
          <p className="text-white text-center mb-6 text-lg">
            <span className="font-bold text-pink-400">{currentUser.name}</span> et <span className="font-bold text-purple-400">{matchedUser.name}</span>, vous pouvez maintenant échanger en toute sécurité !
          </p>

          <div className="space-y-4">
            <button onClick={onOpenChat} className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all">
              <MessageCircle size={24} />
              Envoyer un message à {matchedUser.name.split(' ')[0]}
            </button>

            <button onClick={onClose} className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-lg transition-all">
              Continuer à swiper
            </button>
          </div>

          <p className="text-gray-400 text-xs text-center mt-6">
            🔒 Vos conversations sont privées et sécurisées
          </p>
        </div>
      </div>
    </div>
  );
};
