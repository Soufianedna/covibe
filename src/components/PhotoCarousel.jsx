import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PhotoCarousel = ({ photos = [], name = 'Profil' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-48 h-48 rounded-full mx-auto bg-slate-700 flex items-center justify-center text-6xl mb-4">
        👤
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  if (photos.length === 1) {
    return (
      <div className="relative mx-auto mb-4">
        <img
          src={photos[0].photo_url || photos[0]}
          alt={name}
          className="w-48 h-48 rounded-full object-cover border-4 border-pink-500"
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto mb-4 w-48">
      {/* Photo principale */}
      <img
        src={photos[currentIndex].photo_url || photos[currentIndex]}
        alt={`${name} - Photo ${currentIndex + 1}`}
        className="w-48 h-48 rounded-full object-cover border-4 border-pink-500"
      />

      {/* Boutons de navigation */}
      {photos.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all"
          >
            <ChevronRight size={20} className="text-white" />
          </button>

          {/* Indicateurs de position */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-pink-500 w-6'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Compteur */}
      {photos.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full">
          {currentIndex + 1}/{photos.length}
        </div>
      )}
    </div>
  );
};
