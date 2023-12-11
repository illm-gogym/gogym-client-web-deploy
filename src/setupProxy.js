const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
	app.use(
		'/api',
		createProxyMiddleware({
			target: 'http://59.18.236.206:8080',
			changeOrigin: true,
		})
	);
};