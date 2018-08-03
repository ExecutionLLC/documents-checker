import React from 'react';
import { Nav, Navbar, NavItem } from 'react-bootstrap';


function Navigation(props) {

    const tabs = [
        {
            url: '/adddoc',
            title: 'Add document'
        },
        {
            url: '/confirmation',
            title: 'Confirm document'
        },
        {
            url: '/checkdoc',
            title: 'Check document'
        },
    ];

    return (
        <Navbar>
            <Nav>
                {tabs.map(tab => (
                    <NavItem
                        key={tab.url}
                        href={tab.url}
                        active={tab.url === props.page}
                    >
                        {tab.title}
                    </NavItem>
                ))}
            </Nav>
        </Navbar>
    );
}

export default Navigation;
