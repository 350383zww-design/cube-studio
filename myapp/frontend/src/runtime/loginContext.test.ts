import { getLoginPageContext } from './loginContext';

describe('loginContext', () => {
    afterEach(() => {
        delete window.__CUBE_LOGIN_CONTEXT__;
    });

    test('defaults rememberMe to false', () => {
        expect(getLoginPageContext().rememberMe).toBe(false);
    });

    test('reads rememberMe from runtime context', () => {
        window.__CUBE_LOGIN_CONTEXT__ = {
            rememberMe: true,
        };

        expect(getLoginPageContext().rememberMe).toBe(true);
    });
});
