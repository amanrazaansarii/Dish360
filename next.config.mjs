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
  // Landing variations live as static files in public/variants. Next serves
  // public/ by exact path only, so send the folder URL to its chooser page.
  async redirects() {
    return [
      { source: "/variants", destination: "/variants/index.html", permanent: false },
    ];
  },
};

export default nextConfig;
