/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude officegen and related Node.js modules from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
        zlib: false,
        util: false,
        buffer: false,
        os: false,
        events: false,
        child_process: false,
      }
      
      config.externals = config.externals || []
      config.externals.push('officegen')
    }
    
    return config
  },
  experimental: {
    serverComponentsExternalPackages: ['officegen']
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
