const { createProxyMiddleware } = require('http-proxy-middleware');

const proxyTarget = process.env.REACT_APP_PROXY_TARGET || 'http://localhost';

// https://create-react-app.dev/docs/proxying-api-requests-in-development/
module.exports = function (app) {
    // 重定向 /frontend 到 /frontend/
    app.use((req, res, next) => {
        if (req.path === '/frontend' && !req.path.endsWith('/')) {
            return res.redirect(301, '/frontend/');
        }
        next();
    });

    app.use(
        ['/workflow_modelview'],
        createProxyMiddleware({
            target: proxyTarget,
            changeOrigin: true,
        })
    );

    app.use(
        ['**/api/**', '/myapp', '/login', '/logout', '/idex', '/users', '/roles', '/static/assets', '/static/appbuilder', '/static/frontend-login', '/pipeline_modelview', '/project_modelview'],
        createProxyMiddleware({
            target: proxyTarget,
            changeOrigin: true,
        })
    );
};
