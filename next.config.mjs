/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Landing-page variants live as static files in public/variants. Next serves
  // public/ by exact path only, so send the folder URL to its chooser page.
  async redirects() {
    return [
      { source: "/variants", destination: "/variants/index.html", permanent: false },
    ];
  },
};

export default nextConfig;
