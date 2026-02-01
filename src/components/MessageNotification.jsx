import { X, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export const MessageNotification = ({ message, sender, onClose, onClick }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000); // Disparaît après 5 secondes

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      onClick={onClick}
      className={`fixed bottom-6 right-6 bg-slate-800 border-2 border-pink-500 rounded-2xl shadow-2xl p-4 max-w-sm cursor-pointer transform transition-all duration-300 hover:scale-105 z-50 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
    >
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="absolute top-2 right-2 p-1 hover:bg-slate-700 rounded-lg transition-all"
      >
        <X size={16} className="text-gray-400" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-2">
          <MessageCircle size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold mb-1">Nouveau message de {sender}</p>
          <p className="text-gray-300 text-sm line-clamp-2">{message}</p>
        </div>
      </div>
    </div>
  );
};