const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
	app.use(
		'/api',
		createProxyMiddleware({
			target: 'http://gogym.co.kr:8080',
			changeOrigin: true,
		})
	);
};