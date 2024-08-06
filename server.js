const cors_proxy = require('cors-anywhere');

cors_proxy.createServer({
  originWhitelist: [], // Allow all origins
  requireHeader: ['origin', 'x-requested-with'],
  removeHeaders: ['cookie', 'cookie2']
}).listen(10000, '0.0.0.0', function() {
  console.log('Running CORS Anywhere on 0.0.0.0:10000');
});
