import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.less';
import zhCN from 'antd/lib/locale/zh_CN';
import { ConfigProvider, Spin } from 'antd';
import './store/index'

import {
  BrowserRouter, HashRouter
} from "react-router-dom";
import cookies from 'js-cookie';
import { handleTips } from './api';
import { setTheme } from './theme';
import LoadingStar from './components/LoadingStar/LoadingStar';
import globalConfig from './global.config';

Spin.setDefaultIndicator(<LoadingStar />)

setTheme(globalConfig.theme)

const isLocalPreviewBypass = process.env.NODE_ENV === 'development'
if (isLocalPreviewBypass && !cookies.get('myapp_username')) {
  cookies.set('myapp_username', 'local-preview')
}

let isLogin = false
const userName = cookies.get('myapp_username')

if (!!userName || isLocalPreviewBypass) {
  isLogin = true
} else {
  handleTips.gotoLogin()
}

ReactDOM.render(
  isLogin ?
    <ConfigProvider locale={zhCN}>
      <BrowserRouter basename={process.env.REACT_APP_BASE_ROUTER || '/'}>
        <App />
      </BrowserRouter>
    </ConfigProvider> : <></>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
