import { MessageCircle } from 'lucide-react';

// Bloc actions "on est matchés" (message + unmatch), partagé entre les
// différents endroits qui affichent un match confirmé. Le bouton binôme et le
// lien "Quitter le binôme" sont optionnels — ils dépendent de la fonctionnalité
// search_partnerships, pas encore branchée partout.
export const ProfileMatchActions = ({
  onSendMessage,
  onUnmatch,
  partnershipSlot,
  onLeavePartnership,
}) => (
  <div className="bg-gradient-to-r from-violet-600/20 to-indigo-500/20 border border-violet-500/50 rounded-xl p-4">
    <button onClick={onSendMessage} className="flex items-center justify-center gap-3 w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">
      <MessageCircle size={24} />
      Envoyer un message
    </button>
    {partnershipSlot}
    <div className="flex items-center justify-center gap-3 mt-3">
      <button onClick={onUnmatch} className="text-sm text-red-400/60 hover:text-red-400/90 transition-all">
        Unmatch
      </button>
      {onLeavePartnership && (
        <>
          <span className="text-slate-600">|</span>
          <button onClick={onLeavePartnership} className="text-sm text-red-400/60 hover:text-red-400/90 transition-all">
            Quitter le binôme
          </button>
        </>
      )}
    </div>
  </div>
);
