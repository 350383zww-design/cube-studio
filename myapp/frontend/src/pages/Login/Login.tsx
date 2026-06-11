import React, { useEffect } from 'react';
import { Alert, Button, Card, Checkbox, Input, Typography } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, UserOutlined } from '@ant-design/icons';
import { ILoginPageContext } from '../../runtime/loginContext';
import './Login.less';

const { Title, Text, Link } = Typography;

interface ILoginProps {
    context: ILoginPageContext;
}

const getAlertType = (category: string) => {
    if (category === 'danger') {
        return 'error';
    }
    if (category === 'warning' || category === 'error' || category === 'success' || category === 'info') {
        return category;
    }
    return 'info';
};

const LoginPage: React.FC<ILoginProps> = ({ context }) => {
    useEffect(() => {
        document.title = `登录 - ${context.title}`;
    }, [context.title]);

    return (
        <div className="login-page">
            <section className="login-page__hero">
                <div className="login-page__brand">
                    {context.logo ? (
                        <img
                            className="login-page__brand-logo"
                            src={context.logo}
                            alt={context.title}
                        />
                    ) : null}
                    <div className="login-page__brand-copy">
                        <p className="login-page__brand-label">Cube Studio</p>
                        <h1 className="login-page__brand-title">{context.title}</h1>
                    </div>
                </div>
            </section>

            <section className="login-page__panel">
                <Card className="login-page__card" bordered={false}>
                    <Title className="login-page__card-title" level={3}>{context.formTitle}</Title>
                    <Text className="login-page__card-subtitle">使用站内统一前端登录入口进入系统</Text>

                    {context.messages.length ? (
                        <div className="login-page__alerts">
                            {context.messages.map((item, index) => (
                                <Alert
                                    key={`${item.category}-${index}`}
                                    type={getAlertType(item.category)}
                                    message={item.message}
                                    showIcon
                                />
                            ))}
                        </div>
                    ) : null}

                    <form className="login-page__form" action={context.action} method="post" autoComplete="on">
                        <input type="hidden" name="csrf_token" value={context.csrfToken} />

                        <div className="login-page__field">
                            <Text className="login-page__field-label">用户名</Text>
                            <Input
                                autoFocus
                                size="large"
                                name="username"
                                defaultValue={context.username}
                                placeholder="请输入用户名"
                                autoComplete="username"
                                prefix={<UserOutlined />}
                            />
                        </div>

                        <div className="login-page__field">
                            <Text className="login-page__field-label">密码</Text>
                            <Input.Password
                                size="large"
                                name="password"
                                placeholder="请输入密码"
                                autoComplete="current-password"
                                prefix={<LockOutlined />}
                                iconRender={(visible) => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                            />
                        </div>

                        <div className="login-page__options">
                            <Checkbox name="remember_me" value="1" defaultChecked={context.rememberMe}>记住密码</Checkbox>
                        </div>

                        <Button className="login-page__submit" type="primary" htmlType="submit" block>
                            登录
                        </Button>

                        {context.registerUrl ? (
                            <div className="login-page__register">
                                <Link href={context.registerUrl}>注册新账号</Link>
                            </div>
                        ) : null}
                    </form>

                    <div className="login-page__footer">
                        <span className="login-page__footer-line"></span>
                        <span className="login-page__footer-text">{context.footerName}</span>
                        <span className="login-page__footer-line"></span>
                    </div>
                </Card>
            </section>
        </div>
    );
};

export default LoginPage;
