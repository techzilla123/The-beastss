const createServer = require('cors-anywhere').createServer;

module.exports = (req, res) => {
  const originBlacklist = [];
  const originWhitelist = [];
  const checkRateLimit = require('../my-cors-proxy/node_modules/cors-anywhere/lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

  const corsProxy = createServer({
    originBlacklist: originBlacklist,
    originWhitelist: originWhitelist,
    requireHeader: ['origin', 'x-requested-with'],
    checkRateLimit: checkRateLimit,
    removeHeaders: [
      'cookie',
      'cookie2',
      'x-request-start',
      'x-request-id',
      'via',
      'connect-time',
      'total-route-time',
    ],
    redirectSameOrigin: true,
    httpProxyOptions: {
      xfwd: false,
    },
  });

  req.url = req.url.replace(/^\/api\/cors-proxy/, '');

  corsProxy.emit('request', req, res);
};
