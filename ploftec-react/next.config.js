/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    // 👇 Esto hace que ESLint NO rompa el build en producción
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
