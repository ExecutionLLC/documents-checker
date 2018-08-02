import React from 'react';
import { Nav, Navbar, NavItem } from 'react-bootstrap';


function Navigation() {
    return (
        <Navbar>
            <Nav>
                <NavItem href="/adddoc">
                    Add document
                </NavItem>
                <NavItem href="/checkdoc">
                    Check document
                </NavItem>
                <NavItem href="/confirmation">
                    Document confirmation
                </NavItem>
            </Nav>
        </Navbar>
    );
}

export default Navigation;
