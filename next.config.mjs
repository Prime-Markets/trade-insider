/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
      ignoreDuringBuilds: true,
  },
  typescript:{
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/vi/**'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**' 
      },
      {
        protocol: 'https',
        hostname: '*.gstatic.com',
        port: '',
        pathname: '/images/**'
      }
    ]
  }
}
export default nextConfig