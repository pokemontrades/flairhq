import React, { useState, useEffect, useContext } from "react";
import styled from 'styled-components';
import { StoreContext } from '../state';
import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem } from 'reactstrap';

import logo from '../images/fhq-500.png';

const LogoContainer = styled(NavbarBrand)`
  height: 50px;
`;

const Logo = styled.img`
  margin-top: -15px;
  max-width: 100px;
`;

export default function App () {
  const [loggedIn, setLoggedIn] = useState(undefined);
  const [isOpen, setIsOpen] = useState(false);

  const { state: {user}, dispatch, actions: {SET_USER} } = useContext(StoreContext);

  const toggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    if ((!user || !user.name) && loggedIn !== false) {
      async function fetchData() {
        const res = await fetch('/api/me', {
          headers: {
            'Accept': 'application/json'
          },
        });
        if (!res.ok) {
          return setLoggedIn(false);
        }
        const userData = await res.json();
        setLoggedIn(true);
        return dispatch({
          type: SET_USER,
          payload: userData
        });
      }
      fetchData();
    }
  });


  return (
    <Navbar color="dark" dark expand="md">
      <LogoContainer href="/"><Logo src={logo}/></LogoContainer>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="ml-auto" navbar>
          <NavItem>
            <NavLink href="/info">Information</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="/tools">Tools</NavLink>
          </NavItem>
          {user && user.isMod && (
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Moderator
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>
                  Stuff
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          )}
          {user && user.name ? (
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                {user.name}
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem href="/logout">
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          ) : (
            <NavItem><NavLink href="/api/auth/reddit">Login</NavLink></NavItem>
          )}
        </Nav>
      </Collapse>
    </Navbar>
  );
};
