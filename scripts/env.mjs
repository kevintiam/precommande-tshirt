// Charge .env.local comme le fait Next : les scripts tournent hors de Next
// et n'héritent donc d'aucune de ses variables.
import { readFileSync } from 'node:fs';

export function chargerEnv(chemin = '.env.local') {
  for (const ligne of readFileSync(chemin, 'utf8').split('\n')) {
    const separateur = ligne.indexOf('=');
    if (separateur < 1 || ligne.startsWith('#')) continue;
    const cle = ligne.slice(0, separateur).trim();
    let valeur = ligne.slice(separateur + 1).trim();
    if (valeur.startsWith('"') && valeur.endsWith('"')) {
      valeur = valeur.slice(1, -1);
    }
    // `??=` et non `=` : une variable déjà posée dans le shell l'emporte.
    process.env[cle] ??= valeur;
  }
}
