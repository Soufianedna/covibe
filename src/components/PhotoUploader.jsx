import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export const PhotoUploader = ({ userId, existingPhotos = [], onPhotosChange }) => {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const MAX_PHOTOS = 6;

  // Charger les photos au montage et quand existingPhotos change
  useEffect(() => {
    console.log("📸 PHOTOS REÇUES:", existingPhotos);
    if (Array.isArray(existingPhotos) && existingPhotos.length > 0) {
      setPhotos(existingPhotos);
    }
  }, [existingPhotos]);

  const uploadPhoto = async (file) => {
    try {
      setUploading(true);

      // Upload vers Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      const photoUrl = data.publicUrl;

      // Sauvegarder dans la table profile_photos
      const position = photos.length;
      const { error: dbError } = await supabase
        .from('profile_photos')
        .insert({
          user_id: userId,
          photo_url: photoUrl,
          position: position
        });

      if (dbError) throw dbError;

      const newPhotos = [...photos, { photo_url: photoUrl, position }];
      setPhotos(newPhotos);
      if (onPhotosChange) onPhotosChange(newPhotos);

      // Si c'est la première photo, mettre à jour photo_url dans profiles
      if (position === 0) {
        await supabase
          .from('profiles')
          .update({ photo_url: photoUrl })
          .eq('user_id', userId);
      }

    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Erreur lors de l\'upload de la photo');
    } finally {
      setUploading(false);
    }
  };

  const handleNativeCamera = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });
      const res = await fetch(image.dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      uploadPhoto(file);
    } catch (e) {
      if (!e.message?.includes('cancel') && !e.message?.includes('Cancel')) {
        console.error('Camera error:', e);
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image doit faire moins de 5MB');
      return;
    }

    uploadPhoto(file);
  };

  const deletePhoto = async (index) => {
    if (!confirm('Supprimer cette photo ?')) return;

    try {
      const photo = photos[index];
      
      // Supprimer de la base
      await supabase
        .from('profile_photos')
        .delete()
        .eq('user_id', userId)
        .eq('photo_url', photo.photo_url);

      // Supprimer du storage
      const filePath = photo.photo_url.split('/profile-photos/')[1];
      if (filePath) {
        await supabase.storage
          .from('profile-photos')
          .remove([filePath]);
      }

      const newPhotos = photos.filter((_, i) => i !== index);
      
      // Réorganiser les positions
      for (let i = 0; i < newPhotos.length; i++) {
        await supabase
          .from('profile_photos')
          .update({ position: i })
          .eq('user_id', userId)
          .eq('photo_url', newPhotos[i].photo_url);
      }

      setPhotos(newPhotos);
      if (onPhotosChange) onPhotosChange(newPhotos);

      // Si on supprime la première photo, mettre à jour photo_url dans profiles
      if (index === 0 && newPhotos.length > 0) {
        await supabase
          .from('profiles')
          .update({ photo_url: newPhotos[0].photo_url })
          .eq('user_id', userId);
      } else if (newPhotos.length === 0) {
        await supabase
          .from('profiles')
          .update({ photo_url: null })
          .eq('user_id', userId);
      }

    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const movePhoto = async (index, direction) => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= photos.length) return;

    const newPhotos = [...photos];
    [newPhotos[index], newPhotos[newIndex]] = [newPhotos[newIndex], newPhotos[index]];
    
    // Mettre à jour les positions dans la base
    try {
      for (let i = 0; i < newPhotos.length; i++) {
        await supabase
          .from('profile_photos')
          .update({ position: i })
          .eq('user_id', userId)
          .eq('photo_url', newPhotos[i].photo_url);
      }

      setPhotos(newPhotos);
      if (onPhotosChange) onPhotosChange(newPhotos);

      // Si on déplace depuis/vers la position 0, mettre à jour photo_url
      if (index === 0 || newIndex === 0) {
        await supabase
          .from('profiles')
          .update({ photo_url: newPhotos[0].photo_url })
          .eq('user_id', userId);
      }

    } catch (error) {
      console.error('Error reordering photos:', error);
      alert('Erreur lors du réarrangement');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Photos ({photos.length}/{MAX_PHOTOS})</h3>
        {photos.length > 0 && (
          <p className="text-sm text-gray-400">La première photo sera ta photo de profil</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div key={`photo-${index}-${photo.photo_url}`} className="relative aspect-square rounded-xl overflow-hidden bg-slate-700 group">
            <img
              src={photo.photo_url}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Erreur chargement image:", photo.photo_url);
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23334155' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23fff' font-size='20'%3E❌%3C/text%3E%3C/svg%3E";
              }}
            />
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Photo principale
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {index > 0 && (
                <button
                  onClick={() => movePhoto(index, 'left')}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                >
                  <ChevronLeft size={20} className="text-white" />
                </button>
              )}
              <button
                onClick={() => deletePhoto(index)}
                className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-all"
              >
                <X size={20} className="text-white" />
              </button>
              {index < photos.length - 1 && (
                <button
                  onClick={() => movePhoto(index, 'right')}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                >
                  <ChevronRight size={20} className="text-white" />
                </button>
              )}
            </div>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-gray-500 hover:border-violet-500 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700" onClick={Capacitor.isNativePlatform() ? (e) => { e.preventDefault(); handleNativeCamera(); } : undefined}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading || Capacitor.isNativePlatform()}
              className="hidden"
            />
            {uploading ? (
              <div className="text-center">
                <div className="animate-spin text-violet-500 mb-2">⏳</div>
                <p className="text-sm text-gray-400">Upload...</p>
              </div>
            ) : (
              <>
                <Upload size={32} className="text-gray-400" />
                <p className="text-sm text-gray-400">Ajouter une photo</p>
              </>
            )}
          </label>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Maximum 6 photos • JPG, PNG • Max 5MB par photo
      </p>
    </div>
  );
};
