/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // The home page is a static page in public/home (plain HTML, CSS and JS, no
  // framework runtime), served at "/". beforeFiles makes it win over
  // app/page.tsx, which is kept in the code base but no longer shown.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/home/index.html" }],
    };
  },
};

export default nextConfig;
