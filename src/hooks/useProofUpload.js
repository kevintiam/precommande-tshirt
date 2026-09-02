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
        'Image trop lourde : 2 Mo maximum.'
      );
      return;
    }

    setFichier(choisi);
    setErreurPreuve('');
  };

  const envoyerPreuve = async (order) => {
    if (!fichier || envoiPreuve) return;
    setEnvoiPreuve(true);
    setErreurPreuve('');

    try {
      const donnees = new FormData();
      donnees.append('capture', fichier);

      const res = await fetch(`/api/commandes/${order.ref}/preuve`, {
        method: 'POST',
        body: donnees,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Erreur ${res.status}.`);
      }

      try {
        await fetch('/api/sendReceipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: order.email,
            customerName: order.firstName || 'Client',
            orderId: order.ref,
            total: order.total,
            items: order.items ?? order.lignes ?? [],
          }),
        });
        console.log('E-mail envoyé avec succès !');
      } catch (mailError) {
        console.error("L'image est passée, mais l'e-mail a échoué :", mailError);
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