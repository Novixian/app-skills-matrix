import * as React from 'react';
import { connect } from 'react-redux';
import { Image, Navbar, Nav, NavItem, Glyphicon, MenuItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { gitHubAuth } from './constants';
const GitHubLogo = require('../../img/GitHub-Light.png');
import './header.scss';

type HeaderProps = {
  username?: string,
  brandLink: string,
  links?: { name: string, path: string, standardLink?: boolean }[],
};

const Header = ({ username, brandLink, links }: HeaderProps) => (
  <Navbar inverse collapseOnSelect>
    <Navbar.Header>
      <Navbar.Brand>
        <a href={brandLink}>
          <Glyphicon glyph="equalizer"/>
          {' SKILLS MATRIX'}
        </a>
      </Navbar.Brand>
      <Navbar.Toggle />
    </Navbar.Header>
    <Navbar.Collapse>
      <Nav>
        {
          links && links.map(({ name, path, standardLink = false }) =>
            (standardLink
              ? <MenuItem key={path} href={path}>{name}</MenuItem>
              : <LinkContainer key={path} to={path} activeClassName="active"><NavItem>{name}</NavItem></LinkContainer>))
        }
      </Nav>
      <Nav pullRight>
        {
          username
            ? <NavItem>{username}</NavItem>
            : <div className="login-link__container">
              <a className="login-link" href={gitHubAuth}>
                <Image src={GitHubLogo} height={20} />
                {' '}Log in with GitHub
                </a>
              </div>
        }
      </Nav>
    </Navbar.Collapse>
  </Navbar>
);

export default Header;

