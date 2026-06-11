export interface ILoginFlashMessage {
    category: string;
    message: string;
}

export interface ILoginPageContext {
    title: string;
    logo: string;
    favicon: string;
    formTitle: string;
    footerName: string;
    action: string;
    csrfToken: string;
    registerUrl: string;
    username: string;
    rememberMe: boolean;
    messages: ILoginFlashMessage[];
}

declare global {
    interface Window {
        __CUBE_LOGIN_CONTEXT__?: Partial<ILoginPageContext>;
    }
}

const defaultLoginPageContext: ILoginPageContext = {
    title: 'Cube-Studio',
    logo: '',
    favicon: '',
    formTitle: '用户登录',
    footerName: 'Cube-Studio',
    action: '/login/',
    csrfToken: '',
    registerUrl: '',
    username: '',
    rememberMe: false,
    messages: [],
};

export const getLoginPageContext = (): ILoginPageContext => {
    const runtimeContext = window.__CUBE_LOGIN_CONTEXT__ || {};

    return {
        ...defaultLoginPageContext,
        ...runtimeContext,
        messages: runtimeContext.messages || [],
    };
};
