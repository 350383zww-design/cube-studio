import React from 'react';
import { render } from '@testing-library/react';
import MixSearch from './MixSearch';

describe('MixSearch', () => {
  test('renders the shared compact search layout hooks', () => {
    const { container } = render(
      <MixSearch
        params={[
          { name: 'name', type: 'input', title: '名称' },
          { name: 'user', type: 'input', title: '用户' },
        ]}
        onChange={() => {}}
      />,
    );

    expect(container.querySelector('.cmdb-mixsearch-group .ant-input-group-compact')).toBeInTheDocument();
    expect(container.querySelector('.cmdb-mixsearch-key')).toBeInTheDocument();
    expect(container.querySelector('.cmdb-mixsearch-value')).toBeInTheDocument();
    expect(container.querySelector('.cmdb-mixsearch-add')).toBeInTheDocument();
  });
});
