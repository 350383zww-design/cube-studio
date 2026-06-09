import { buildPrimaryNavSections, getActivePrimaryNavPath, getNextExpandedSectionKeys, IPrimaryNavEntry } from './App';
import { IRouterConfigPlusItem } from './api/interface/baseInterface';
import { getThemeConfig } from './theme';

const mockNavTree: IRouterConfigPlusItem[] = [
  {
    path: '/group',
    title: '项目空间',
    name: 'group',
    children: [
      {
        path: '/group/project_group',
        title: '项目组',
        isMenu: true,
        children: [
          {
            path: '/group/project_group/org_group',
            title: '项目分组',
          },
        ],
      },
      {
        path: '/group/project',
        title: '安全设置(管理员)',
        isMenu: true,
        children: [
          {
            path: '/group/project/user',
            title: '用户列表',
          },
          {
            path: '/group/project/log',
            title: '日志列表',
          },
        ],
      },
      {
        path: '/group/links',
        title: '链接(管理员)',
        isMenu: true,
        children: [
          {
            path: '/group/links/k8s',
            title: 'K8s Dashboard',
            menu_type: 'out_link',
            url: 'https://example.com/k8s',
          },
        ],
      },
    ],
  },
  {
    path: '/train',
    title: '模型训练',
    name: 'train',
    children: [],
  },
];

describe('app layout helpers', () => {
  test('flattens nested side menu groups into section titles and clickable items', () => {
    const sections = buildPrimaryNavSections(mockNavTree);
    expect(sections).toHaveLength(2);
    expect(sections[0].title).toBe('项目空间');
    expect(sections[0].entries.map((entry: IPrimaryNavEntry) => `${entry.kind}:${entry.title}`)).toEqual([
      'label:项目组',
      'item:项目分组',
      'label:安全设置(管理员)',
      'item:用户列表',
      'item:日志列表',
      'label:链接(管理员)',
      'item:K8s Dashboard',
    ]);
  });

  test('resolves active primary section from current pathname', () => {
    const activePath = getActivePrimaryNavPath('/group/project_group/org_group', {
      '/group': mockNavTree[0],
      '/train': mockNavTree[1],
    });

    expect(activePath).toBe('/group');
  });

  test('reuses expanded section state when nothing changes', () => {
    const prevKeys = ['/group', '/train'];
    const nextKeys = getNextExpandedSectionKeys(prevKeys, ['/group', '/train']);

    expect(nextKeys).toBe(prevKeys);
  });

  test('defaults to expanding only 项目空间', () => {
    expect(getNextExpandedSectionKeys([], ['/group', '/train'])).toEqual(['/group']);
  });
});

describe('theme tokens', () => {
  test('uses the updated global primary colors', () => {
    const starTheme = getThemeConfig('star');
    expect(starTheme['--ant-primary-color']).toBe('#136DDC');
    expect(starTheme['--ant-primary-1']).toBe('#E9F3FF');
  });
});
