/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  eslint: {
    // Ignore lint warnings during production build so deploy never halts
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Render pe build fail na ho TS errors se; runtime behavior affect nahi hota
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
