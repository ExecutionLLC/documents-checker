import React from 'react';
import { Nav, Navbar, NavItem } from 'react-bootstrap';


function Navigation(props) {

    const tabs = [
        {
            url: '/routing_sheet',
            title: 'Маршрутный лист'
        },
        {
            url: '/report',
            title: 'Отчет'
        },
        {
            url: '/checkdoc',
            title: 'Сверка маршрутных листов'
        },
        {
            url: '/checkact',
            title: 'Сверка акта'
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
