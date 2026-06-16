import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from './Login';
import { ILoginPageContext } from '../../runtime/loginContext';

const buildContext = (overrides: Partial<ILoginPageContext> = {}): ILoginPageContext => ({
    title: '边海防模型生成与迁移软件平台',
    logo: '/static/assets/images/brand/logoCB.png',
    favicon: '/static/assets/images/brand/logoCB.png',
    formTitle: '用户登录',
    footerName: '边海防模型生成与迁移软件平台',
    action: '/login/',
    csrfToken: 'csrf-token',
    registerUrl: '',
    username: '',
    rememberMe: false,
    messages: [],
    ...overrides,
});

describe('LoginPage', () => {
    test('renders the updated brand and login card without english subtitle', () => {
        render(<LoginPage context={buildContext()} />);

        expect(screen.getByRole('heading', { name: '边海防模型生成与迁移软件平台' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '用户登录' })).toBeInTheDocument();
        expect(screen.getByLabelText('平台品牌区')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument();
        expect(screen.queryByText(/cube studio/i)).not.toBeInTheDocument();
    });
});
