import { completeLogout, getDirectLoginUrl, getLogoutUrl } from './index';

describe('handleTips logout flow', () => {
    test('builds logout and login urls on current host', () => {
        expect(getLogoutUrl('127.0.0.1:3000')).toBe('//127.0.0.1:3000/logout');
        expect(getDirectLoginUrl('127.0.0.1:3000')).toBe('//127.0.0.1:3000/login/');
    });

    test('logs out then redirects directly to the login page', async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
        } as Response);
        const replaceSpy = jest.fn();
        const locationLike = {
            host: '127.0.0.1:3000',
            replace: replaceSpy,
        };

        await completeLogout(fetchMock as unknown as typeof fetch, locationLike);

        expect(fetchMock).toHaveBeenCalledWith(
            '//127.0.0.1:3000/logout',
            expect.objectContaining({
                credentials: 'include',
                redirect: 'manual',
            }),
        );
        expect(replaceSpy).toHaveBeenCalledWith('//127.0.0.1:3000/login/');
    });
});
