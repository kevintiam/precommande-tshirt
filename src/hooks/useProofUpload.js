// hooks/useProofUpload.js
import { useState } from 'react';

const TAILLE_MAX_PREUVE = 2 * 1024 * 1024;

export function useProofUpload(onSuccess) {
  const [fichier, setFichier] = useState(null);
  const [envoiPreuve, setEnvoiPreuve] = useState(false);
  const [erreurPreuve, setErreurPreuve] = useState('');


  const handleFileChange = (e) => {
    const choisi = e.target.files?.[0] ?? null;

    if (choisi && choisi.size > TAILLE_MAX_PREUVE) {
      setFichier(null);
      setErreurPreuve(
        'Image trop lourde : 2 Mo maximum. Réduis-la ou fais une capture plus petite.'
      );
      return;
    }

    setFichier(choisi);
    setErreurPreuve('');
  };


  const envoyerPreuve = async (orderRef) => {
    if (!fichier || envoiPreuve) return;
    setEnvoiPreuve(true);
    setErreurPreuve('');

    try {
      const donnees = new FormData();
      donnees.append('capture', fichier);

      const res = await fetch(`/api/commandes/${orderRef}/preuve`, {
        method: 'POST',
        body: donnees,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Erreur ${res.status}.`);
      }

      setFichier(null);
      onSuccess();
    } catch (err) {
      console.error('Envoi de la capture impossible :', err);
      setErreurPreuve(err.message || 'Envoi impossible. Réessaie.');
    } finally {
      setEnvoiPreuve(false);
    }
  };

  return {
    fichier,
    envoiPreuve,
    erreurPreuve,  
    handleFileChange, 
    envoyerPreuve,   
  };
}