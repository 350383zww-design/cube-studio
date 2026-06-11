import { getFrontendMode, isLoginPath } from './appMode';

describe('appMode', () => {
    test('treats /login/ as the react login page shell', () => {
        expect(isLoginPath('/login')).toBe(true);
        expect(isLoginPath('/login/')).toBe(true);
        expect(isLoginPath('/frontend/')).toBe(false);
    });

    test('renders login mode on login path even without auth cookie', () => {
        expect(getFrontendMode({
            pathname: '/login/',
            isAuthenticated: false,
            isLocalPreviewBypass: false,
        })).toBe('login');
    });

    test('redirects unauthenticated non-login requests', () => {
        expect(getFrontendMode({
            pathname: '/frontend/',
            isAuthenticated: false,
            isLocalPreviewBypass: false,
        })).toBe('redirect');
    });

    test('renders app when user is authenticated', () => {
        expect(getFrontendMode({
            pathname: '/frontend/',
            isAuthenticated: true,
            isLocalPreviewBypass: false,
        })).toBe('app');
    });
});
