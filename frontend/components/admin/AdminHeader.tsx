import * as React from 'react';
import { connect } from 'react-redux';

import Header from '../common/Header';
import * as selectors from '../../modules/admin';

type AdminHeaderProps = {
  username?: string,
};

const AdminHeader = ({ username }: AdminHeaderProps) => (
  <Header
    username={username}
    brandLink="/admin/users"
    links={[
      { name: 'Users', path: '/admin/users' },
      { name: 'Templates', path: '/admin/templates' },
      { name: 'Exit admin tool', path: '/', standardLink: true },
    ]}
  />
);

export default connect(
  state => ({
    username: selectors.getLoggedInUsername(state),
  }), null, null, { pure: false }, /* Required for NavItem 'active' class: https://github.com/react-bootstrap/react-router-bootstrap/issues/152 */
)(AdminHeader);
