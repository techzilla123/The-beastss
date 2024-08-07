const corsAnywhere = require('cors-anywhere');
require('dotenv').config();

module.exports = async (req, res) => {
  const originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
  const originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);

  const checkRateLimit = require('cors-anywhere/lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

  const cors_proxy = corsAnywhere.createServer({
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

  cors_proxy.emit('request', req, res);
};

function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}
