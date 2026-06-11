import globalConfig from './global.config';

describe('globalConfig logo assets', () => {
    it('uses the shared backend static logo for app and loading states', () => {
        expect(globalConfig.appLogo).toBe('/static/assets/images/brand/logoCB.png');
        expect(globalConfig.loadingLogo).toBe('/static/assets/images/brand/logoCB.png');
    });
});
