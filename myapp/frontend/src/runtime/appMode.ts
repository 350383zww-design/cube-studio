export type FrontendMode = 'app' | 'login' | 'redirect';

export const isLoginPath = (pathname: string) => {
    return pathname === '/login' || pathname === '/login/';
};

interface IGetFrontendModeOptions {
    pathname: string;
    isAuthenticated: boolean;
    isLocalPreviewBypass: boolean;
}

export const getFrontendMode = ({
    pathname,
    isAuthenticated,
    isLocalPreviewBypass,
}: IGetFrontendModeOptions): FrontendMode => {
    if (isLoginPath(pathname)) {
        return 'login';
    }

    if (isAuthenticated || isLocalPreviewBypass) {
        return 'app';
    }

    return 'redirect';
};
