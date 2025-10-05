/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Check if we're running in a Docker environment
    //const isDocker = process.env.DOCKER_ENV === 'true';
    const isDocker = process.env.DOCKER_ENV !== '';
    
    // Default API URL based on environment
    //Do not use localhost because it's ambiguous re ::1 vs. 127.0.0.1 and our backend is bound to 127.0.0.1
    const defaultApiUrl = isDocker 
      ? 'http://backend:8000'
      : 'http://127.0.0.1:8000'; 
    
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` 
          : `${defaultApiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
