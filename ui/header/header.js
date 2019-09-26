import React, { useState, useEffect } from "react";
import {
  Collapse,
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

export default function App () {
  const [loggedIn, setLoggedIn] = useState(undefined);
  const [user, setUser] = useState({});
  const [isOpen, setIsOpen] = useState(false);

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
        setUser(userData);
      }
      fetchData();
    }
  });


  return (
    <div>
      <Navbar color="dark" dark expand="md">
        <NavbarBrand href="/">FlairHQ</NavbarBrand>
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
    </div>
  );
};
