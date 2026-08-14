import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Camera, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const PropertyPhotosUploader = ({ userId, existingPhotos, onPhotosChange }) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-property-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const position = existingPhotos.length;
      const { data, error } = await supabase
        .from('property_photos')
        .insert({ user_id: userId, url: publicUrl, position })
        .select()
        .single();

      if (error) throw error;
      onPhotosChange([...existingPhotos, data]);
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId, photoUrl) => {
    try {
      const fileName = photoUrl.split('/').pop();
      await supabase.storage.from('profile-photos').remove([fileName]);
      await supabase.from('property_photos').delete().eq('id', photoId);
      onPhotosChange(existingPhotos.filter(p => p.id !== photoId));
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-3">
        📸 {t('propertyPhotos')} ({existingPhotos.length}/5)
      </label>
      <div className="grid grid-cols-3 gap-4">
        {existingPhotos.map((photo) => (
          <div key={photo.id} className="relative group">
            <img src={photo.url} alt="Property" className="w-full h-32 object-cover rounded-xl" />
            <button
              onClick={() => deletePhoto(photo.id, photo.url)}
              className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        ))}
        {existingPhotos.length < 5 && (
          <label className="w-full h-32 bg-slate-700/50 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700 transition-all">
            <Camera size={32} className="text-gray-400 mb-2" />
            <span className="text-2xl text-gray-400 font-bold leading-none">{uploading ? '…' : '+'}</span>
            <input type="file" accept="image/*" onChange={uploadPhoto} className="hidden" disabled={uploading} />
          </label>
        )}
      </div>
    </div>
  );
};
