import { TThemeType } from "./theme"

const sharedLogo = '/static/assets/images/brand/logoCB.png';

interface IGlobalConfig {
    appLogo: string,
    loadingLogo: string,
    theme: TThemeType,
}

const globalConfig: IGlobalConfig = {
    appLogo: sharedLogo,
    loadingLogo: sharedLogo,
    theme: 'star',
}

export default globalConfig
