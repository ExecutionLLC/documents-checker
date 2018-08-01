import React from 'react';
import { Panel } from 'react-bootstrap';


function ErrorPanel(props) {
    return (
        <Panel bsStyle="danger">
            <Panel.Heading>
                <Panel.Title componentClass="h3">
                    {props.title}
                </Panel.Title>
            </Panel.Heading>
            <Panel.Body style={{wordBreak: 'break-word'}}>
                {props.content}
            </Panel.Body>
        </Panel>
    );
}

export default ErrorPanel;