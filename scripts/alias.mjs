// Résout l'alias `@/` et les imports sans extension, comme le fait Next,
// pour que les scripts Node puissent importer les modules du projet.
import { pathToFileURL } from 'node:url';
import { resolve as joindre, extname } from 'node:path';
import { existsSync } from 'node:fs';

export function resolve(specifier, context, next) {
  if (!specifier.startsWith('@/')) return next(specifier, context);

  let cible = joindre(process.cwd(), 'src', specifier.slice(2));
  if (!extname(cible)) {
    for (const essai of ['.js', '.jsx', '.mjs']) {
      if (existsSync(cible + essai)) {
        cible += essai;
        break;
      }
    }
  }
  return next(pathToFileURL(cible).href, context);
}
