/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    // Photo de bannière hébergée sur Pexels. Le motif est volontairement
    // étroit : autoriser un domaine entier ouvrirait l'optimiseur
    // d'images à n'importe quelle URL de ce domaine.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/photos/**',
      },
    ],
  },
};

export default nextConfig;
