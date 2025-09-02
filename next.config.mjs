/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude Node.js modules from client-side bundle
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
      config.externals.push('officegen', 'pptxgenjs')
    }
    
    return config
  },
  serverExternalPackages: ['officegen', 'pptxgenjs'],
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
