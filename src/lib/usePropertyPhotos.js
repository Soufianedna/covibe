import { useState, useEffect } from 'react';
import { supabase } from './supabase';

// Fetch des photos du logement d'un profil (property_photos), même requête que
// celle déjà dupliquée dans ProfilePage/ConversationsList/Chat — centralisée
// ici pour les nouveaux appelants plutôt que de la recopier encore.
export function usePropertyPhotos(userId, hasSpace) {
  const [propertyPhotos, setPropertyPhotos] = useState([]);

  useEffect(() => {
    if (!userId || !hasSpace) {
      setPropertyPhotos([]);
      return;
    }
    supabase
      .from('property_photos')
      .select('*')
      .eq('user_id', userId)
      .order('position')
      .then(({ data, error }) => {
        if (error) console.error('Error loading property photos:', error);
        setPropertyPhotos(data || []);
      });
  }, [userId, hasSpace]);

  return propertyPhotos;
}
