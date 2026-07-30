/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ppsldvsodvcbxecxjssf.supabase.co',
      },
    ],
  },
  // Přesměrování ze starých URL na routy sjednocené pod službu /portal/vapneni/*
  // (zavedeno při oddělení služby Vápnění od nové služby Hnojiva a POR).
  async redirects() {
    return [
      {
        source: '/portal/plany-vapneni',
        destination: '/portal/vapneni/plany',
        permanent: false,
      },
      {
        source: '/portal/kalkulacka-ztrat',
        destination: '/portal/vapneni/kalkulacka-ztrat',
        permanent: false,
      },
      {
        source: '/portal/poptavky',
        destination: '/portal/vapneni/poptavky',
        permanent: false,
      },
      {
        source: '/portal/poptavky/nova',
        destination: '/portal/vapneni/poptavky/nova',
        permanent: false,
      },
    ]
  },
};

module.exports = nextConfig;
