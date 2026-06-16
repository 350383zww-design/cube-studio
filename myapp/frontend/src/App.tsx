import React, { useEffect, useMemo, useState } from 'react';
import {
  useRoutes,
  useNavigate,
  useLocation,
  RouteObject
} from "react-router-dom";

import { Drawer, Dropdown } from 'antd';
import { IRouterConfigPlusItem } from './api/interface/baseInterface';
import { formatRoute, routerConfigPlus } from './routerConfig';
import { clearWaterNow, getParam } from './util'
import { getAppHeaderConfig, getAppMenu, getCustomDialog } from './api/kubeflowApi';
import { IAppHeaderItem, ICustomDialog } from './api/interface/kubeflowInterface';
import { AppstoreOutlined, DownOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie'
import { handleTips } from './api';
import globalConfig from './global.config'
import AiChatBot from './components/AiChatBot/AiChatBot'

const RouterConfig = (config: RouteObject[]) => {
  let element = useRoutes(config);
  return element;
}

const getRouterMap = (routerList: IRouterConfigPlusItem[]): Record<string, IRouterConfigPlusItem> => {
  const res: Record<string, IRouterConfigPlusItem> = {}
  const queue = [...routerList]
  while (queue.length) {
    const item = queue.shift()
    if (item) {
      res[item?.path || ''] = item
      if (item?.children && item.children.length) {
        queue.push(...item.children)
      }
    }
  }
  return res
}

const getValidAppList = (config: IRouterConfigPlusItem[]) => config.filter(item => !!item.name && !item.hidden)

export interface IPrimaryNavEntry {
  key: string;
  kind: 'label' | 'item';
  title: string;
  icon?: any;
  path?: string;
  menuType?: string;
  url?: string;
  disabled?: boolean;
}

interface IPrimaryNavSection {
  key: string;
  path?: string;
  title: string;
  entries: IPrimaryNavEntry[];
}

const flattenSectionEntries = (
  items: IRouterConfigPlusItem[] = [],
  inheritedIcon?: any,
): IPrimaryNavEntry[] => {
  return items.reduce<IPrimaryNavEntry[]>((entries, item) => {
    if (item.hidden) {
      return entries;
    }

    if (item.isMenu) {
      entries.push({
        key: `label:${item.path || item.title}`,
        kind: 'label',
        title: item.title || '',
      });

      entries.push(...flattenSectionEntries(item.children || [], item.icon ?? inheritedIcon));
      return entries;
    }

    entries.push({
      key: item.path || `item:${item.title}`,
      kind: 'item',
      title: item.title || '',
      icon: item.icon ?? inheritedIcon,
      path: item.path,
      menuType: item.menu_type,
      url: item.url,
      disabled: !!item.disable,
    });

    return entries;
  }, []);
};

export const buildPrimaryNavSections = (items: IRouterConfigPlusItem[] = []): IPrimaryNavSection[] => {
  return items
    .filter((item) => !item.hidden && !!item.title)
    .map((item) => ({
      key: item.path || item.title || '',
      path: item.path,
      title: item.title || '',
      entries: flattenSectionEntries(item.children || []),
    }));
};

export const getActivePrimaryNavPath = (
  pathname: string,
  appMap: Record<string, IRouterConfigPlusItem>,
): string => {
  const [, stLevel = '', edLevel = ''] = pathname.split('/');
  const stLevelApp = appMap[`/${stLevel}`];

  if (stLevelApp?.isSingleModule) {
    return `/${stLevel}/${edLevel}`;
  }

  return `/${stLevel}`;
};

export const getNextExpandedSectionKeys = (
  prevKeys: string[],
  availableKeys: string[],
): string[] => {
  const retainedKeys = prevKeys.filter((key) => availableKeys.includes(key))
  const defaultKey = availableKeys.includes('/group') ? '/group' : availableKeys[0]

  if (!retainedKeys.length) {
    const nextKeys = defaultKey ? [defaultKey] : []

    if (prevKeys.length === nextKeys.length && prevKeys.every((key, index) => key === nextKeys[index])) {
      return prevKeys
    }
    return nextKeys
  }

  if (prevKeys.length === retainedKeys.length && prevKeys.every((key, index) => key === retainedKeys[index])) {
    return prevKeys
  }

  return retainedKeys
}

const AppWrapper = () => {
  const [sourceAppList, setSourceAppList] = useState<IRouterConfigPlusItem[]>([])
  const [sourceAppMap, setSourceAppMap] = useState<Record<string, IRouterConfigPlusItem>>({})
  const [CurrentRouteComponent, setCurrentRouteComponent] = useState<any>()
  const [expandedSectionKeys, setExpandedSectionKeys] = useState<string[]>([])
  const [imgUrlProtraits, setImgUrlProtraits] = useState('')
  const [customDialogVisable, setCustomDialogVisable] = useState(false)
  const [customDialogInfo, setCustomDialogInfo] = useState<ICustomDialog>()
  const [headerConfig, setHeaderConfig] = useState<IAppHeaderItem[]>([])
  const isShowNav = getParam('isShowNav')

  const navigate = useNavigate();
  const location = useLocation()
  const topLevelNavList = useMemo(() => getValidAppList(sourceAppList), [sourceAppList])
  const primaryNavSections = useMemo(() => buildPrimaryNavSections(topLevelNavList), [topLevelNavList])
  const activePrimaryPath = getActivePrimaryNavPath(location.pathname, sourceAppMap)
  const shouldShowPrimaryNav = isShowNav !== 'false' && location.pathname !== '/' && primaryNavSections.length > 0

  const applyRoutes = (routes: IRouterConfigPlusItem[]) => {
    const routeMap = getRouterMap(routes)
    setSourceAppList(routes)
    setSourceAppMap(routeMap)
    setCurrentRouteComponent(() => () => RouterConfig(routes as RouteObject[]))
  }

  useEffect(() => {
    applyRoutes(routerConfigPlus)

    getAppMenu().then(res => {
      const remoteRoute = res.data

      const dynamicRoute = formatRoute([...remoteRoute])
      const tarRoute = [...dynamicRoute, ...routerConfigPlus]
      applyRoutes(tarRoute)
    }).catch(err => { })

    getAppHeaderConfig().then(res => {
      const config = res.data
      setHeaderConfig(config)
    }).catch(err => { })
  }, [])

  useEffect(() => {
    if (sourceAppList.length && Object.keys(sourceAppMap).length) {
      clearWaterNow()
    }
  }, [location, sourceAppList, sourceAppMap])

  useEffect(() => {
    if (!primaryNavSections.length) {
      return
    }

    setExpandedSectionKeys((prevKeys) => {
      const availableKeys = primaryNavSections.map((section) => section.key)
      return getNextExpandedSectionKeys(prevKeys, availableKeys)
    })
  }, [primaryNavSections])

  useEffect(() => {
    const controller = new AbortController()
    const url = encodeURIComponent(location.pathname)
    getCustomDialog(url, controller.signal).then(res => {
      if(res.status!==502) {
          setCustomDialogInfo(res.data)
          setCustomDialogVisable(res.data.hit)
      }
    }).catch(err => {
      console.error(err);
    })
    return () => {
      controller.abort()
    }
  }, [location])

  const handleClickNav = (app: IRouterConfigPlusItem, subPath?: string) => {

    if (app.path === '/') {
      navigate(app.path || '/')
    } else if (app.menu_type === 'iframe' && app.path) {
      navigate(app.path)
    } else if (app.menu_type === 'out_link' && app.url) {
      window.open(app.url, 'blank')
    } else if (app.menu_type === 'in_link' && app.path) {
      window.open(app.url, 'blank')
    } else {

      const currentApp = sourceAppMap[subPath || '']

      let currentItem = subPath ? currentApp : app

      while (currentItem && currentItem.children?.length) {
        currentItem = currentItem.children[0]
      }

      if (currentItem) {
        let appMenuPath = currentItem.path || ''
        navigate(appMenuPath)
      }
    }
  }

  const renderIcon = (icon: any, className = 'icon-custom svg16') => {
    if (!icon) {
      return null
    }

    if (Object.prototype.toString.call(icon) === '[object String]') {
      return <div className={className} dangerouslySetInnerHTML={{ __html: icon }}></div>
    }

    return <span className={className}>{icon}</span>
  }

  const handlePrimaryEntryClick = (entry: IPrimaryNavEntry) => {
    if (entry.disabled) {
      return
    }

    if (entry.menuType === 'out_link' || entry.menuType === 'in_link') {
      window.open(entry.url, 'blank')
      return
    }

    if (entry.path) {
      navigate(entry.path)
    }
  }

  const renderPrimaryNav = () => {
    if (!shouldShowPrimaryNav) {
      return null
    }

    return <aside className="primary-nav">
      {primaryNavSections.map((section) => {
        const isExpanded = expandedSectionKeys.includes(section.key)
        const isActiveSection = activePrimaryPath === section.path

        return <section className="primary-nav__section" key={section.key}>
          <button
            className={`primary-nav__section-trigger${isActiveSection ? ' primary-nav__section-trigger--active' : ''}`}
            type="button"
            onClick={() => {
              if (!section.entries.length && section.path && sourceAppMap[section.path]) {
                handleClickNav(sourceAppMap[section.path], section.path)
                return
              }

              setExpandedSectionKeys((prevKeys) => prevKeys.includes(section.key)
                ? prevKeys.filter((key) => key !== section.key)
                : [...prevKeys, section.key])
            }}
          >
            <span className="primary-nav__section-title">{section.title}</span>
            {section.entries.length ? <DownOutlined className={`primary-nav__section-arrow${isExpanded ? ' primary-nav__section-arrow--expanded' : ''}`} /> : null}
          </button>

          {isExpanded && section.entries.length ? <div className="primary-nav__entries">
            {section.entries.map((entry) => {
              if (entry.kind === 'label') {
                return <div className="primary-nav__group-label" key={entry.key}>{entry.title}</div>
              }

              const isActiveItem = entry.path === location.pathname

              return <button
                className={`primary-nav__item${isActiveItem ? ' primary-nav__item--active' : ''}${entry.disabled ? ' primary-nav__item--disabled' : ''}`}
                disabled={entry.disabled}
                key={entry.key}
                type="button"
                onClick={() => handlePrimaryEntryClick(entry)}
              >
                {renderIcon(entry.icon)}
                <span className="primary-nav__item-text">{entry.title}</span>
              </button>
            })}
          </div> : null}
        </section>
      })}
    </aside>
  }

  return (
    <div className="content-container fade-in">
      {/* Header */}
      {
        isShowNav === 'false' ? null : <div className="navbar">
          <div className="d-f ac pl24 h100">
            <div className="d-f ac">
              <div className="cp pr16 logo" style={{ width: 'auto' }} onClick={() => {
                navigate('/', { replace: true })
              }}>
                <img src={globalConfig.appLogo} alt="img" />
                <h2>边海防模型生成与迁移软件平台</h2>
              </div>
            </div>
          </div>

          <div className="d-f ac plr16 h100">
            <Dropdown menu={{ items: [
              { key: 'user-center', label: '用户中心', onClick: () => navigate('/user') },
              {
                key: 'logout',
                label: '退出登录',
                onClick: () => {
                  Cookies.remove('myapp_username');
                  handleTips.userlogout()
                },
              },
            ] }}>
              <img className="mr8 cp" style={{ borderRadius: 200, height: 32 }} src={imgUrlProtraits} onError={() => {
                setImgUrlProtraits(require('./images/male.png'))
              }} alt="img" />
            </Dropdown>
          </div>
        </div>
      }

      <div className="main-content-container">
        {renderPrimaryNav()}

        <div className="ov-a w100 bg-title p-r" id="componentContainer">
          {/* 自定义弹窗 */}
          {
            customDialogVisable ? <Drawer
              getContainer={false}
              style={{ position: 'absolute', height: 'calc(100vh - 100px)', top: '10%', ...customDialogInfo?.style }}
              bodyStyle={{ padding: 0 }}
              mask={false}
              contentWrapperStyle={{ width: 'auto' }}
              title={customDialogInfo?.title} placement="right" onClose={() => { setCustomDialogVisable(false) }}
              visible={customDialogVisable}>
              <div className="h100" dangerouslySetInnerHTML={{ __html: customDialogInfo?.content || '' }}></div>
            </Drawer> : null
          }
          {
            CurrentRouteComponent && <CurrentRouteComponent />
          }
        </div>

        {
          customDialogInfo?.content ? <div className="c-text-w fs12 p-f" style={{ backgroundColor: 'transparent', zIndex: 10, right: 16, bottom: 32 }}>
            <div className="bg-theme d-f jc ac cp" style={{ borderRadius: 6, width: 36, height: 36 }} onClick={() => {
              setCustomDialogVisable(true)
            }}><AppstoreOutlined style={{ color: '#fff', fontSize: 22 }} /></div>
          </div> : null
        }

      </div >
      {/* AI 机器人悬浮按钮与聊天面板，固定在页面右下角，全局可用 */}
      <AiChatBot />
    </div>
  );
};

export default AppWrapper;
