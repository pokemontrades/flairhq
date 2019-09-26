import React, { useState, useEffect } from "react";
import { Link } from "@reach/router";
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
  const [user, setUser] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (!user || !user.name) {
      async function fetchData() {
        const userData = await fetch('/api/me').then((res) => res.json());
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
              <NavLink href="/">Home</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="/info">Info</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="/tools">Tools</NavLink>
            </NavItem>
            {user && user.isMod && <NavItem>You are a mod</NavItem>}
            {user && user.name ? (
              <NavItem><NavLink href="/logout">Logout</NavLink></NavItem>
            ) : (
              <NavItem><NavLink href="/api/auth/reddit">Login</NavLink></NavItem>
            )}
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Options
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>
                  Option 1
                </DropdownItem>
                <DropdownItem>
                  Option 2
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem>
                  Reset
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
};
