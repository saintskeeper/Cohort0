// next.config.js

module.exports = {
    async rewrites() {
      return [
        {
          source: '/metrics',
          destination: '/api/metrics',
        },
      ];
    },
    // Other Next.js configuration options can be added here
}