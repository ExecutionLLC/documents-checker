import React from 'react';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import config from '../config';


function Navigation(props) {

    const tabs = [
        {
            url: `${config.BASE_PATH}/routing_sheet`,
            title: 'Маршрутный лист'
        },
        {
            url: `${config.BASE_PATH}/report`,
            title: 'Отчет'
        },
        {
            url: `${config.BASE_PATH}/checkdoc`,
            title: 'Сверка маршрутных листов'
        },
        {
            url: `${config.BASE_PATH}/checkact`,
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
